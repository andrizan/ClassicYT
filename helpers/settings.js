/* Settings model shared by the content scripts and the extension pages (popup, config, changelog). */
const storage = browser.storage.sync;

const defaultSettings = {
	"completedSettingsTutorial": false,
	"language": "auto",
	"gridItems": 6,
	"hideAutoplayButton": false,
	"hideCastButton": false,
	"darkPlaylist": true,
	"smallPlayer": true,
	"smallPlayerWidth": 853,
	"showRawValues": true,
	"classicLikesColors": false,
	"autoConfirm": true,
	"disableInfiniteScrolling": false,
	"blackBars": true,
	"rearrangeInfo2": true,
	"classicLogoChoice": 2017,
	"filterMainRe": false,
	"filterVideo": true,
	"filterMiniRe": true,
	"extraLayout": true,
	"darkerRed": false,
	"immersiveFullscreen": false,
	"trueFullscreen": false,
	"favicon": 3,
	"squareAvatar": true,
	"squareSubs": true,
	"noHomeScalingRe": true,
	"squareSearch": true,
	"squareComments": true,
	"extraSidebarStyles": true,
	"playlistsFirst": true,
	"sortFoundPlaylists": true,
	"customTitleFont": false,
	"titleFontValue": "Arial",
	"hideVoiceSearch": false,
	"subBorder": true,
	"classicLikesStyle": true,
	"classicLikesIconColors": false,
	"hideJoinButton": false,
	"hideThanks": false,
	"trimSubs": false,
	"trimViews": false,
	"altStrings": false,
	"extraChannel": true,
	"noPlayerActionAnimations": false,
	"altLoader": false,
	"altLoaderSmaller": false,
	"showChangelog": true,
	"oldIcons": true,
	"extraComments": true,
	"collapseSidebar": false,
	"hideShorts": true,
	"redirectShorts": false,
	"hideRelatedVideoAgeRe": false,
	"hideVideoCategory": true,
	"hideDescriptionExtras": false,
	"moveAutoplay": true,
	"disableMiniplayer": false,
	"hideCountryCode": false,
	"disableVideoPreview": false,
	"autoExpandSidebarSections": false,
	"compatibleDislikesRe": true,
	"hideDislikes": false,
	"hideDownload": false,
	"hideChaptersInSearch": true,
	"hideChaptersInDescription": true,
	"hideHeatmap": false,
	"hideSurveys": true,
	"hideHomeChannelAvatars": true,
	"hideMixTopStack": true,
	"ignoreAmbientAdjustment": false,
	"hideClickAnimations": true,
	"hideHashtags": true,
	"altUploadIcon": true,
	"hideTicketShelf": true,
	"hideAISummary": true,
	"hideEndScreen": false,
	"hideExtraSearchCategories": true
};

/* Returns the stored settings completed with any defaults that are missing (e.g. after an update). */
function withDefaults(stored) {
	if (!stored || typeof stored !== 'object' || Array.isArray(stored)) {
		return { settings: { ...defaultSettings }, changed: true };
	}
	let changed = false;
	for (const key in defaultSettings) {
		if (!(key in stored)) {
			stored[key] = defaultSettings[key];
			changed = true;
		}
	}
	return { settings: stored, changed };
}

/* Used by the extension pages; the content script reads storage itself to batch its lookups. */
async function loadSettings() {
	const { reduxSettings } = await storage.get('reduxSettings');
	const { settings, changed } = withDefaults(reduxSettings);
	if (changed) storage.set({ reduxSettings: settings });
	return settings;
}
