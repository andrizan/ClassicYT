'use strict';
/* Runs at document_idle and handles everything the injected styles can't express.
   Work is triggered by YouTube's navigation events and by observers instead of polling the page; the only
   timers left are the 'Video paused' check and a once-a-second comparison of the URL. */

const flags = {
	"isRearranged": false,
	"trueFullscreenListenersAdded": false,
	"playerListenersAdded": false
};
const TEXT_CHANGES = { childList: true, characterData: true, subtree: true };
const INFO_TOOLTIP = '#description tp-yt-paper-tooltip:not([disable-upgrade]) > #tooltip';
const LIKE_BUTTON = '#above-the-fold #segmented-like-button button, #above-the-fold like-button-view-model button';
const BUTTON_TEXT = '.ytSpecButtonShapeNextButtonTextContent';
const RELATED_ITEMS = '#secondary > #secondary-inner > #related > ytd-watch-next-secondary-results-renderer > #items';
const SHOW_MORE_STYLE = 'font-family: Roboto, Arial, sans-serif; padding-top: 9px; width: 100%; border-top: 1px solid #e2e2e2; border-bottom: none; border-left: none; border-right: none; background:none; font-size: 1.1rem; outline: none; cursor:pointer; text-transform: uppercase; font-weight: 500; color: var(--redux-spec-text-secondary); letter-spacing: 0.007px;';
//icon names YouTube uses in its own data for the buttons below the player; they don't depend on the UI language
const FLEXIBLE_ICONS = {
	"thanks": ['MONEY_HEART', 'MONEY_HAND'],
	"save": ['PLAYLIST_ADD', 'BOOKMARK_BORDER']
};

let YTReduxURLPath;
let YTReduxURLSearch;
let confirmInterval;
let pageCleanups = []; //undone on every navigation
const trackedElements = new Map();
const expandedSections = new WeakSet();
let hiddenThanksButton = null;

function createElement(tag, properties, children) {
	const element = Object.assign(document.createElement(tag), properties);
	if (children) element.append(...children);
	return element;
}

function setText(element, text) {
	if (element && element.textContent !== text) element.textContent = text;
}

/* Same as setText, for elements that YouTube or another extension (e.g. Return YouTube Dislike) writes to as
   well. If the text keeps getting replaced, the element is left alone until the next navigation rather than
   fought over. */
let contestedElements = new WeakMap();
function setContestedText(element, text) {
	if (!element || element.textContent === text) return;
	const now = Date.now();
	let state = contestedElements.get(element);
	if (!state || (!state.lost && now - state.since > 5000)) {
		state = { since: now, writes: 0, lost: false };
		contestedElements.set(element, state);
	}
	if (state.lost) return;
	if (++state.writes > 20) {
		state.lost = true;
		return;
	}
	element.textContent = text;
}

/* Observes one element per key. YouTube usually keeps its elements between navigations, so the observer
   is only replaced when the element itself was. */
function track(key, element, options, callback) {
	const current = trackedElements.get(key);
	if (current?.element === element) return;
	current?.observer.disconnect();
	const observer = new MutationObserver(callback);
	observer.observe(element, options);
	trackedElements.set(key, { element, observer });
}

/* ---------- waiting for elements ---------- */
const waiters = new Set();
let waiterCheckTimer = null;
let waiterObserving = false;
const waiterObserver = new MutationObserver(() => scheduleWaiterCheck(50));

function scheduleWaiterCheck(delay) {
	if (waiterCheckTimer === null) waiterCheckTimer = setTimeout(checkWaiters, delay);
}

function stopWaitingIfIdle() {
	if (waiters.size === 0 && waiterObserving) {
		waiterObserver.disconnect();
		waiterObserving = false;
	}
}

function checkWaiters() {
	waiterCheckTimer = null;
	for (const waiter of [...waiters]) {
		if (!waiters.has(waiter)) continue; //removed while an earlier callback ran
		const element = document.querySelector(waiter.selector);
		if (!element) continue;
		clearTimeout(waiter.timeoutId);
		waiters.delete(waiter);
		try {
			waiter.callback(element);
		} catch (error) {
			log(error, true);
		}
	}
	stopWaitingIfIdle();
}

/* Calls back once the selector matches. All pending selectors share a single throttled observer. */
function waitForElement(selector, callback, timeout = 1 * 60 * 1000) {
	const waiter = { selector, callback, timeoutId: null };
	if (timeout) {
		waiter.timeoutId = setTimeout(() => {
			if (!waiters.delete(waiter)) return;
			log(`Did not find ${selector} after ${timeout}ms (${callback.name})`);
			stopWaitingIfIdle();
		}, timeout);
	}
	waiters.add(waiter);
	if (!waiterObserving) {
		waiterObserver.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'aria-label'] });
		waiterObserving = true;
	}
	scheduleWaiterCheck(0);
}

function clearWaiters() {
	for (const waiter of waiters) clearTimeout(waiter.timeoutId);
	waiters.clear();
	stopWaitingIfIdle();
}

/* ---------- auto confirm ---------- */
function confirmIt() {
	const confirmButton = document.querySelector('ytd-popup-container yt-confirm-dialog-renderer > #main > div.buttons > #confirm-button');
	if (!confirmButton) return;
	const buttonParent = confirmButton.closest('tp-yt-paper-dialog');
	const buttonParentVisible = !!buttonParent && buttonParent.style.display !== 'none';
	const buttonVisible = document.querySelector('ytd-popup-container tp-yt-paper-dialog:not([aria-hidden="true"])');
	//only the 'Video paused' dialog comes without a cancel button
	const popupElement = document.querySelector('ytd-popup-container yt-confirm-dialog-renderer > #main > div.buttons > yt-button-renderer');
	const popupTypeCheck = !!popupElement && popupElement.hasAttribute('hidden');
	if (buttonVisible && popupTypeCheck && buttonParentVisible) {
		confirmButton.click();
		document.querySelector('video')?.play()?.catch(() => {});
	}
}

function startAutoConfirm() {
	if (confirmInterval != undefined) return;
	confirmInterval = setInterval(confirmIt, 500);
	//simulate activity so that the popup shows up less often
	setInterval(() => {
		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'F2', code: 'F2', keyCode: 113, which: 113 }));
	}, 60000*10);
}

/* ---------- small player ---------- */
function isTheater() {
	return document.querySelector('ytd-watch-flexy[theater]') != null;
}

function isFullscreen() {
	return document.querySelector('ytd-watch-flexy[fullscreen]') != null;
}

let playerResizeObserver;
let playerResizeTarget = null;
let playerSyncQueued = false;
const lastPlayerSync = { width: 0, height: 0, attempts: 0, time: 0 };

/* YouTube's player lays itself out for the size it believes it has, which isn't the size the small player
   styles give it. Tells the player its real size and limits the playlist panel to the player's height. */
function syncPlayerSize() {
	if (pageLocation !== PAGE_LOCATION.Video || isTheater() || isFullscreen()) return;
	const container = document.querySelector('#player-container-outer');
	const width = container ? container.clientWidth : 0;
	const height = container ? container.clientHeight : 0;
	if (!width || !height) return;

	const calcInner = `
		#playlist > #container,
		ytd-playlist-panel-renderer#playlist {
			max-height: ${height}px !important;
		}
	`;
	let reduxAlignElement = document.querySelector('#redux-style-align');
	if (!reduxAlignElement) {
		reduxAlignElement = createElement('style', { id: 'redux-style-align' });
		document.head.append(reduxAlignElement);
	}
	if (reduxAlignElement.textContent !== calcInner) {
		reduxAlignElement.replaceChildren(document.createTextNode(calcInner));
	}

	const now = Date.now();
	if (lastPlayerSync.width !== width || lastPlayerSync.height !== height || now - lastPlayerSync.time > 2000) {
		Object.assign(lastPlayerSync, { width, height, attempts: 0 });
	}
	try {
		const player = document.querySelector('#movie_player')?.wrappedJSObject;
		if (typeof player?.setInternalSize !== 'function') return;
		const current = typeof player.getPlayerSize === 'function' ? player.getPlayerSize() : null;
		const matches = current && Math.abs(current.width - width) <= 1 && Math.abs(current.height - height) <= 1;
		//the attempts limit keeps this from fighting the player in a loop if it never reports the requested size
		if (!matches && lastPlayerSync.attempts < 5) {
			lastPlayerSync.attempts++;
			lastPlayerSync.time = now;
			player.setInternalSize(width, height);
		}
	} catch (error) {
		log(error, true);
	}
}

function schedulePlayerSync() {
	if (playerSyncQueued) return;
	playerSyncQueued = true;
	requestAnimationFrame(() => {
		playerSyncQueued = false;
		syncPlayerSize();
	});
}

function watchPlayerSize() {
	const container = document.querySelector('#player-container-outer');
	if (container && container !== playerResizeTarget) {
		playerResizeObserver ??= new ResizeObserver(schedulePlayerSync);
		if (playerResizeTarget) playerResizeObserver.unobserve(playerResizeTarget);
		playerResizeObserver.observe(container);
		playerResizeTarget = container;
	}
	//the player writes its size to the video element whenever it recalculates its own layout
	const video = document.querySelector('#movie_player video');
	if (video) track('playerVideo', video, { attributes: true, attributeFilter: ['style'] }, schedulePlayerSync);
	if (!flags.playerListenersAdded) {
		document.addEventListener('fullscreenchange', schedulePlayerSync);
		flags.playerListenersAdded = true;
	}
	lastPlayerSync.attempts = 0;
	schedulePlayerSync();
}

/* ---------- infinite scrolling ---------- */
function createShowMoreButton(id, wrapperStyle, buttonStyle, onClick) {
	const expandButton = document.querySelector('#description tp-yt-paper-button#expand');
	const button = createElement('input', { type: 'button', value: expandButton?.textContent.trim() || t('showMore') });
	button.style.cssText = SHOW_MORE_STYLE + buttonStyle;
	const wrapper = createElement('div', { id }, [button]);
	wrapper.style.cssText = wrapperStyle;
	wrapper.addEventListener('click', () => {
		onClick();
		window.scrollBy({top: 50, left: 0, behavior: "smooth"});
		wrapper.remove();
	});
	return wrapper;
}

function limitComments() {
	const contentsElement = document.querySelector('#comments > #sections > #contents.style-scope.ytd-item-section-renderer');
	if (!contentsElement) return;
	const commentsInterval = 20;
	let maxComments = commentsInterval;
	const observerComments = new MutationObserver(disableInfiniteComments);
	const observe = () => observerComments.observe(contentsElement, { childList: true });

	function disableInfiniteComments() {
		const comments = document.querySelectorAll('#contents > ytd-comment-thread-renderer');
		const commentsContElement = document.querySelector('ytd-comments#comments ytd-item-section-renderer > #contents > ytd-comment-thread-renderer + ytd-continuation-item-renderer');
		if (comments.length < maxComments || commentsContElement == null) return;
		observerComments.disconnect();
		commentsContElement.remove();
		if (document.querySelector('#show-more-comments') == null) {
			contentsElement.append(createShowMoreButton('show-more-comments', 'text-align:center; margin-bottom: 16px; margin-right: 15px;', ' padding-bottom: 8px;', () => {
				contentsElement.append(commentsContElement);
				maxComments += commentsInterval;
				observe();
			}));
		}
	}

	function resetCommentsObserver() {
		document.querySelectorAll('#contents > ytd-comment-thread-renderer').forEach(element => element.remove());
		document.querySelector('#show-more-comments')?.remove();
		maxComments = commentsInterval;
		observe();
	}

	document.querySelector('#show-more-comments')?.remove();
	observe();
	disableInfiniteComments();
	document.querySelectorAll('div[slot="dropdown-content"] > #menu > a').forEach(element => {
		element.onclick = resetCommentsObserver;
	});
	pageCleanups.push(() => observerComments.disconnect());
}

function limitRelated() {
	const relatedInterval = 20;
	let relatedElement;
	let related;
	let relatedContinuation;
	let maxRelated;
	const observerRelated = new MutationObserver(disableInfiniteRelated);
	const observe = () => observerRelated.observe(relatedElement, { childList: true });

	function setLayoutDifferences() {
		const items = document.querySelector(RELATED_ITEMS);
		//the related videos are nested one level deeper depending on the YT language
		relatedElement = items && items.childElementCount <= 3 ? items.querySelector(':scope > ytd-item-section-renderer > #contents') : items;
		if (!relatedElement) return false;
		related = relatedElement.querySelectorAll('yt-lockup-view-model');
		relatedContinuation = relatedElement.querySelector('ytd-continuation-item-renderer');
		return true;
	}

	function addRelatedButton() {
		const continueElement = relatedContinuation;
		relatedElement.append(createShowMoreButton('show-more-related', 'text-align:center; margin-top: 4px; margin-right: 15px', '', () => {
			relatedElement.append(continueElement);
			maxRelated += relatedInterval;
			observe();
		}));
	}

	function disableInfiniteRelated() {
		if (!setLayoutDifferences()) return;
		if (related.length >= maxRelated && relatedContinuation != null) {
			observerRelated.disconnect();
			relatedContinuation.remove();
			if (document.querySelector('#show-more-related') == null) {
				addRelatedButton();
			}
		}
	}

	document.querySelector('#show-more-related')?.remove();
	if (!setLayoutDifferences()) return;
	maxRelated = related.length >= 39 ? 20 : related.length; //to reset max on url change;
	if (related.length >= maxRelated && relatedContinuation != null) {
		relatedContinuation.remove();
		addRelatedButton();
	}
	observe();
	pageCleanups.push(() => observerRelated.disconnect());
}

/* ---------- old video page layout ---------- */
function readVideoInfo() {
	const tooltip = document.querySelector(INFO_TOOLTIP);
	const parts = (tooltip ? tooltip.textContent : '').split('•');
	return {
		loaded: parts[0].trim() !== '',
		views: parts[0].trim(),
		date: (parts[1] || '').trim()
	};
}

function createLikeBar() {
	const likeBar = createElement('div', { id: 'like-bar', className: 'style-scope ytd-sentiment-bar-renderer redux-like-bar' });
	const container = createElement('div', { id: 'container', className: 'style-scope ytd-sentiment-bar-renderer redux-like-bar-container' }, [likeBar]);
	return createElement('div', null, [container]);
}

function rearrangeInfo() {
	const videoInfo = document.querySelector('#primary-inner ytd-watch-metadata');
	if (!videoInfo || flags.isRearranged) return;
	// primary div
	const container = videoInfo.querySelector('#above-the-fold');
	const topRow = videoInfo.querySelector('#top-row');
	const owner = videoInfo.querySelector('#owner');
	const uploadInfo = videoInfo.querySelector('#upload-info');
	const description = videoInfo.querySelector("#description");
	if (!container || !topRow || !owner || !uploadInfo || !description || topRow.parentElement !== container) return;

	const subButton = videoInfo.querySelector('#subscribe-button');
	const subCount = videoInfo.querySelector('#owner-sub-count');
	const { views, date } = readVideoInfo();

	const reduxSubDiv = createElement('div', { id: 'reduxSubDiv' });
	uploadInfo.append(reduxSubDiv);
	if (subButton) reduxSubDiv.append(subButton);
	if (subCount) reduxSubDiv.append(subCount);

	// move owner info between title and top row buttons
	container.insertBefore(owner, topRow);

	// video stats div
	const reduxViewsCount = createElement('div', { id: 'redux-views-count', textContent: views });
	owner.append(createElement('div', { id: 'redux-video-stats' }, [reduxViewsCount, createLikeBar()]));

	// secondary div with description
	description.prepend(createElement('div', { id: 'redux-moved-date', textContent: date }));

	flags.isRearranged = true;
}

/* Keeps the moved views count and upload date in line with the video that's currently shown. */
function updateVideoInfo() {
	if (!flags.isRearranged) return;
	const { loaded, views, date } = readVideoInfo();
	if (loaded) {
		setText(document.querySelector('#redux-views-count'), views);
		setText(document.querySelector('#redux-moved-date'), date);
	}

	const reduxViewsLikesContainer = document.querySelector('#redux-video-stats');
	if (reduxViewsLikesContainer && !document.querySelector('.redux-like-bar')) {
		reduxViewsLikesContainer.append(createLikeBar());
		updateLikeCounters();
	}
	if (reduxSettings.trimViews) trimViews();
}

/* ---------- likes and dislikes ---------- */
function stripSeparators(text) {
	return text.replace(/[,.\s]/g, '');
}

function formatNumber(number, sample) {
	let separator = ' ';
	if (sample.includes('.')) {
		separator = '.';
	} else if (sample.includes(',')) {
		separator = ',';
	}
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

/* Shows precise likes (taken from the button's label) and, when Return YouTube Dislike is installed,
   precise dislikes and the likes bar (taken from its tooltip, e.g. '6,312 / 104'). */
function updateLikeCounters() {
	const likesButton = document.querySelector(LIKE_BUTTON);
	const rawLikes = likesButton?.getAttribute('aria-label')?.match(/\d(?:.*\d)?/)?.[0] || '';
	if (reduxSettings.showRawValues && rawLikes) {
		setContestedText(likesButton.querySelector(BUTTON_TEXT), rawLikes);
	}

	if (!reduxSettings.compatibleDislikesRe) return;
	const dislikesSource = document.querySelector('#top-level-buttons-computed .ryd-tooltip #tooltip');
	if (!dislikesSource) return;
	const sourceText = dislikesSource.textContent;
	const rawDislikes = stripSeparators(sourceText.includes('/') ? sourceText.slice(sourceText.indexOf('/') + 1) : sourceText);
	const dislikes = parseInt(rawDislikes);
	if (isNaN(dislikes)) return;

	if (reduxSettings.showRawValues) {
		const views = document.querySelector('#redux-views-count')?.textContent || '';
		setContestedText(document.querySelector(`#above-the-fold dislike-button-view-model button ${BUTTON_TEXT}`), formatNumber(dislikes, views + rawLikes));
	}

	const likes = parseInt(stripSeparators(rawLikes));
	const likeBar = document.querySelector('#above-the-fold #like-bar.ytd-sentiment-bar-renderer');
	if (likeBar && !isNaN(likes) && likes + dislikes > 0) {
		const width = (likes / (likes + dislikes)) * 100 + '%';
		if (likeBar.style.width !== width) likeBar.style.width = width;
	}
}

function trackLikeCounters(buttonsContainer) {
	track('likes', buttonsContainer, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['aria-label'] }, updateLikeCounters);
	updateLikeCounters();
}

/* ---------- strings ---------- */
function trimSubs() {
	const subString = document.querySelector('#reduxSubDiv > #owner-sub-count') || document.querySelector('#info #owner-sub-count');
	const container = document.querySelector('#reduxSubDiv');
	if (!subString || !container) return;

	const trimmed = subString.textContent.trim().replace(/\s+\S*$/g, '');
	let reduxTrimSpan = document.querySelector('#redux-trim-span');
	if (trimmed === '') {
		reduxTrimSpan?.remove();
		return;
	}
	if (!reduxTrimSpan) {
		reduxTrimSpan = createElement('span', { id: 'redux-trim-span', className: 'style-scope ytd-video-owner-renderer' });
		container.insertBefore(reduxTrimSpan, subString);
	}
	setText(reduxTrimSpan, trimmed);
}

function trimViews() {
	const views = document.querySelector('#redux-views-count') || document.querySelector('span.view-count:not(#redux-views-count-trimmed)');
	const container = document.querySelector('#redux-video-stats') || document.querySelector('#count ytd-video-view-count-renderer');
	if (!views || !container) return;

	let reduxViewsTrimmed = document.querySelector('#redux-views-count-trimmed');
	if (!reduxViewsTrimmed) {
		reduxViewsTrimmed = createElement('span', { id: 'redux-views-count-trimmed', className: 'view-count style-scope ytd-video-view-count-renderer' });
		container.prepend(reduxViewsTrimmed);
	}
	views.style.display = 'none';
	setText(reduxViewsTrimmed, views.textContent.replace(/[^,.\d\s]/g,'').trim());
	track('views', views, TEXT_CHANGES, trimViews);
}

/* Finds one of the buttons below the player (Save, Thanks, ...) through YouTube's own data. */
function findFlexibleButton(iconNames) {
	try {
		const menu = document.querySelector('#above-the-fold ytd-menu-renderer');
		const items = menu?.wrappedJSObject?.data?.flexibleItems;
		const buttons = menu?.querySelector('#flexible-item-buttons')?.children;
		if (!items || !buttons) return null;
		for (let i = 0; i < items.length; i++) {
			const iconName = items[i]?.menuFlexibleItemRenderer?.topLevelButton?.buttonViewModel?.iconName;
			if (iconNames.includes(iconName)) return buttons[i] || null;
		}
	} catch (error) {
		log(error, true);
	}
	return null;
}

function updateFlexibleButtons() {
	if (reduxSettings.hideThanks) {
		const thanksButton = findFlexibleButton(FLEXIBLE_ICONS.thanks)
			|| document.querySelector('#above-the-fold path[d^="M16.25 2A6.7 6.7 0 0012 3.509"]')?.closest('#flexible-item-buttons > *')
			|| null;
		if (thanksButton !== hiddenThanksButton) {
			hiddenThanksButton?.removeAttribute('redux-hidden');
			thanksButton?.setAttribute('redux-hidden', '');
			hiddenThanksButton = thanksButton;
		}
	}
	if (reduxSettings.altStrings) {
		setContestedText(findFlexibleButton(FLEXIBLE_ICONS.save)?.querySelector(BUTTON_TEXT), t('addTo'));
	}
}

/* ---------- autoplay ---------- */
function addOldAutoplay() {
	let reduxAutoplay = document.querySelector('#redux-autoplay');

	if (getRelatedVideosType() != relatedVideosType) {
		setRelatedVideosType();
		if (reduxAutoplay) {
			reduxAutoplay.remove();
			reduxAutoplay = null;
		}
	}

	const originalAutoplay = document.querySelector('[data-tooltip-target-id="ytp-autonav-toggle-button"]');
	if (window.location.href.includes('&list') || reduxAutoplay || !originalAutoplay) return;

	const relatedContainer = document.querySelector('#secondary-inner.ytd-watch-flexy #related #items ytd-item-section-renderer #contents') || document.querySelector('#secondary-inner.ytd-watch-flexy #related #items');
	if (!relatedContainer) return;

	const label = createElement('span', { id: 'redux-autoplay-label' });
	const checkbox = createElement('input', { id: 'redux-autoplay-checkbox', type: 'checkbox' });
	const toggle = createElement('span', { className: 'redux-autoplay-checkbox-toggle' }, [
		checkbox,
		createElement('label', { id: 'redux-autoplay-checkbox-label', htmlFor: 'redux-autoplay-checkbox' }, [
			createElement('span', { className: 'checked' }),
			createElement('span', { className: 'toggle' }),
			createElement('span', { className: 'unchecked' })
		])
	]);
	const autoplayElement = createElement('div', { id: 'redux-autoplay' }, [
		// the up next title stays empty: YT no longer exposes the next autoplayed item in the related column
		createElement('div', { className: 'redux-auto-left' }, [createElement('span', { id: 'redux-autoplay-upnext' })]),
		createElement('div', { className: 'redux-auto-right' }, [label, toggle])
	]);
	autoplayElement.style.cssText = 'display: flex; justify-content: space-between; padding-right: 24px; padding-bottom: 2px;';
	relatedContainer.parentElement.insertBefore(autoplayElement, relatedContainer);
	toggle.addEventListener('click', () => originalAutoplay.click());

	//mirror the player's own toggle, whose label and state are filled in after it's created
	track('autoplay', originalAutoplay, { attributes: true, subtree: true, attributeFilter: ['aria-label', 'aria-checked'] }, syncOldAutoplay);
	syncOldAutoplay();
}

function syncOldAutoplay() {
	const originalAutoplay = document.querySelector('[data-tooltip-target-id="ytp-autonav-toggle-button"]');
	const checkbox = document.querySelector('#redux-autoplay-checkbox');
	if (!originalAutoplay || !checkbox) return;
	setText(document.querySelector('#redux-autoplay-label'), originalAutoplay.getAttribute('aria-label') || '');
	checkbox.checked = originalAutoplay.querySelector('div[aria-checked]')?.getAttribute('aria-checked') === 'true';
}

function moveAutoplay() {
	addOldAutoplay();
	//the related column and the player controls may still be rendering
	const related = document.querySelector('#secondary-inner.ytd-watch-flexy #related');
	if (!related) return;
	const observer = new MutationObserver(addOldAutoplay);
	observer.observe(related, { childList: true, subtree: true });
	const stop = setTimeout(() => observer.disconnect(), 10000);
	pageCleanups.push(() => {
		observer.disconnect();
		clearTimeout(stop);
	});
	if (!window.location.href.includes('&list') && !document.querySelector('#redux-autoplay')) {
		waitForElement('[data-tooltip-target-id="ytp-autonav-toggle-button"]', addOldAutoplay, 10000);
	}
}

/* ---------- misc ---------- */
function preventScrolling() {

	function scrollingAction(e) {
		e.preventDefault();
	}

	function keysAction(e) {
		if (e.keyCode == 33 || e.keyCode == 34) {
			e.preventDefault();
		}
	}

	document.addEventListener('fullscreenchange', function() {
		setTimeout(() => { //timeout accomodates for fullscreen transition animation
			const fullerscreenButton = document.querySelector('.ytp-right-controls > button.ytp-fullerscreen-edu-button.ytp-button');
			const chapters = document.querySelector('.ytp-chapter-container');
			if (isFullscreen()) {
				if (fullerscreenButton) fullerscreenButton.style.display = 'none';
				if (chapters) chapters.style.pointerEvents = 'none';
				document.addEventListener('wheel', scrollingAction, {passive: false});
				document.addEventListener('keydown', keysAction, {passive: false});
			} else {
				if (chapters) chapters.style.pointerEvents = '';
				document.removeEventListener('wheel', scrollingAction, {passive: false});
				document.removeEventListener('keydown', keysAction, {passive: false});
			}
		}, 25);
	});

	flags.trueFullscreenListenersAdded = true;
}

function sortPlaylists() {
	const baseTimeout = 250;
	const playlistsSelector = '[page-subtype="home"] ytd-two-column-browse-results-renderer #content .ytLockupViewModelCollectionStack2';
	const timers = [];
	const later = (callback, delay) => timers.push(setTimeout(callback, delay));
	let observerPlaylistItems;

	function reorderNewPlaylistItems() {
		const alreadyReorderedItems = document.querySelectorAll('.redux-reordered-playlist-item');
		const playlistItems = document.querySelectorAll(playlistsSelector);

		for (let i = alreadyReorderedItems.length; i < playlistItems.length; i++) {
			const parentEl = playlistItems[i].closest('ytd-rich-item-renderer');
			if (!parentEl) continue;
			later(() => {
				parentEl.style.order = `-${i+1}`;
				parentEl.classList.add('redux-reordered-playlist-item');
			}, baseTimeout);
		}
	}

	later(() => {
		const playlistItems = document.querySelectorAll(playlistsSelector);
		const itemsContainer = document.querySelector('[page-subtype="home"] #contents.ytd-rich-grid-renderer:not(.redux-playlist)');
		if (playlistItems.length == 0) return;

		playlistItems.forEach((item, i) => {
			const parentEl = item.closest('ytd-rich-item-renderer');
			if (!parentEl) return;
			parentEl.style.cssText = 'transition-duration:0.25s; opacity: 0;';
			parentEl.classList.add('redux-reordered-playlist-item');
			later(() => {
				parentEl.style.order = `-${i+1}`;
			}, baseTimeout);
			later(() => {
				parentEl.style.opacity = '1';
			}, baseTimeout*2);
		});

		if (reduxSettings.sortFoundPlaylists && itemsContainer) {
			later(() => {
				observerPlaylistItems = new MutationObserver(reorderNewPlaylistItems);
				observerPlaylistItems.observe(itemsContainer, { childList: true });
			}, baseTimeout*2);
		}
	}, baseTimeout);

	pageCleanups.push(() => {
		timers.forEach(clearTimeout);
		observerPlaylistItems?.disconnect();
	});
}

function expandSidebarSections() {
	const expanders = document.querySelectorAll('#guide-renderer #expander-item');
	for (let i = expanders.length - 1; i >= 0 ; i--) {
		if (expandedSections.has(expanders[i])) continue;
		expandedSections.add(expanders[i]);
		expanders[i].click();
	}
}

function redirectShorts() {
	const currentLocation = window.location.href;
	const redirectLocation = currentLocation.replace('/shorts/', '/watch?v=');
	window.location.replace(redirectLocation);
}

function adjustAmbient(cinematics) {
	if (cinematicsObserver) return;
	const root = document.documentElement;
	const initialProperty = root.style.getPropertyValue('--redux-spec-general-background-a') || "#181818";

	cinematicsObserver = new MutationObserver(() => {
		if (!root.hasAttribute('dark')) return;
		const isAmbient = !!document.querySelector('#cinematics')?.hasChildNodes();
		root.style.setProperty('--redux-spec-general-background-a', isAmbient ? 'transparent' : initialProperty);
	});
	cinematicsObserver.observe(cinematics, { childList: true });
}

/* ---------- per page setup ---------- */
function main() {
	const isVideo = pageLocation === PAGE_LOCATION.Video;

	if (reduxSettings.autoConfirm) {
		startAutoConfirm();
	}
	if (reduxSettings.rearrangeInfo2 && isVideo) {
		if (!flags.isRearranged) {
			waitForElement('#above-the-fold #top-level-buttons-computed > *', rearrangeInfo);
		}
		waitForElement(INFO_TOOLTIP, tooltip => {
			track('videoInfo', tooltip, TEXT_CHANGES, updateVideoInfo);
			updateVideoInfo();
		});
	}
	if (reduxSettings.smallPlayer && isVideo) {
		waitForElement('ytd-watch-flexy #movie_player', watchPlayerSize);
	}
	if (reduxSettings.disableInfiniteScrolling && isVideo) {
		waitForElement('#contents > ytd-comment-thread-renderer, #contents > ytd-message-renderer', limitComments); // additional element in selector for videos with disabled comments
		waitForElement(`${RELATED_ITEMS} ytd-continuation-item-renderer`, limitRelated);
	}
	if ((reduxSettings.showRawValues || reduxSettings.compatibleDislikesRe) && isVideo) {
		waitForElement('#above-the-fold #top-level-buttons-computed', trackLikeCounters);
	}
	if (reduxSettings.trueFullscreen && isVideo && !flags.trueFullscreenListenersAdded) {
		preventScrolling();
	}
	if (reduxSettings.playlistsFirst && pageLocation === PAGE_LOCATION.Home) {
		waitForElement('#page-manager ytd-browse[page-subtype="home"] ytd-two-column-browse-results-renderer #content .ytLockupViewModelCollectionStack2', sortPlaylists);
	}
	if (reduxSettings.trimSubs && isVideo) {
		waitForElement('#reduxSubDiv > #owner-sub-count', subCount => {
			track('subs', subCount, TEXT_CHANGES, trimSubs);
			trimSubs();
		});
	}
	if (reduxSettings.trimViews && isVideo) {
		waitForElement('span.view-count', trimViews);
	}
	if ((reduxSettings.altStrings || reduxSettings.hideThanks) && isVideo) {
		waitForElement('#above-the-fold ytd-menu-renderer #flexible-item-buttons', () => {
			track('flexibleButtons', document.querySelector('#above-the-fold ytd-menu-renderer'), { childList: true, subtree: true }, updateFlexibleButtons);
			updateFlexibleButtons();
		});
	}
	if (reduxSettings.moveAutoplay && isVideo) {
		waitForElement('#secondary-inner #related #contents > yt-lockup-view-model', moveAutoplay);
	}
	if (reduxSettings.disableMiniplayer) {
		waitForElement('.ytp-miniplayer-ui .ytp-miniplayer-close-button', closeButton => closeButton.click());
	}
	if (reduxSettings.autoExpandSidebarSections) {
		waitForElement('#section-items > ytd-guide-collapsible-entry-renderer #expander-item', expandSidebarSections);
	}
	if (reduxSettings.redirectShorts && pageLocation === PAGE_LOCATION.Shorts) {
		redirectShorts();
	}
	if (!reduxSettings.ignoreAmbientAdjustment && getTheme() === THEME.Dark && isVideo) {
		waitForElement('#cinematics', adjustAmbient);
	}
}

function runMain() {
	try {
		main();
	} catch (error) {
		log(error, true);
	}
}

function handleNavigation() {
	if (location.pathname == YTReduxURLPath && location.search == YTReduxURLSearch) return;
	YTReduxURLPath = location.pathname;
	YTReduxURLSearch = location.search;
	setPageLocation();

	clearWaiters();
	pageCleanups.forEach(cleanup => cleanup());
	pageCleanups = [];
	contestedElements = new WeakMap();

	if (reduxSettings.disableInfiniteScrolling) {
		//remove comments because YT sometimes keeps old ones after url change which messes with comments observer checking their length; also applied when sorting
		document.querySelectorAll('#contents > ytd-comment-thread-renderer').forEach(element => element.remove());
	}

	runMain();
}

settingsReady.then(() => {
	setLanguage(reduxSettings.language, document.documentElement.lang);
	setPageLocation();
	YTReduxURLPath = location.pathname;
	YTReduxURLSearch = location.search;
	runMain();

	//YouTube is a single page app; these fire once it has swapped the page's content
	document.addEventListener('yt-navigate-finish', handleNavigation);
	document.addEventListener('yt-page-data-updated', handleNavigation);
	//cheap safety net in case a navigation doesn't announce itself
	setInterval(handleNavigation, 1000);
}).catch(error => log(error, true));
