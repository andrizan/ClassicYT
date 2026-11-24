const CUSTOM = 'Custom'; //value of the "Custom..." option until the user applies their own value
const TAB_STORAGE_KEY = 'classicyt.popupTab';
const tabButtons = [...document.querySelectorAll('[role="tab"]')];
const panels = document.querySelector('.panels');
const slider = document.querySelector('input[type="range"]');
const sliderControl = document.querySelector('.slider-control');
const playerWidthSelect = document.querySelector('select[name="smallPlayerWidth"]');
const titleFontSelect = document.querySelector('select[name="titleFontValue"]');
const languageSelect = document.querySelector('select[name="language"]');
const restoreDialog = document.querySelector('#restore-dialog');
let currentSettings;

document.querySelector('#version').textContent = `v${browser.runtime.getManifest().version}`;

/* Controls that only apply while their parent setting is on; they sit in the .subsettings-container after its row. */
function getSubsettings(setting) {
	const container = setting.closest('.row')?.nextElementSibling;
	if (container == null || !container.classList.contains('subsettings-container')) return [];
	return container.querySelectorAll('.subsetting input, .subsetting select, .subsetting button');
}

document.querySelectorAll('.settings:not(.slider-control)').forEach(setting => {
	setting.addEventListener('change', function() {
		if (this.type === 'checkbox') {
			getSubsettings(this).forEach(element => {
				element.disabled = !this.checked;
				if (!this.checked && element.type === 'checkbox') element.checked = false;
			});
		}
		saveSettings();
	});
});

slider.addEventListener('input', function() {
	sliderControl.value = this.value;
});

sliderControl.addEventListener('change', function() {
	slider.value = this.value;
	this.value = slider.value; //the range clamps out-of-bounds values
	saveSettings();
});

languageSelect.addEventListener('change', applyLanguage);

//tabs: selection follows focus, arrow keys move between tabs
function panelOf(tab) {
	return document.querySelector(`[role="tabpanel"][aria-labelledby="${tab.id}"]`);
}

function selectTab(tab, { focus = false, scrollToTop = false } = {}) {
	for (const other of tabButtons) {
		const selected = other === tab;
		other.setAttribute('aria-selected', String(selected));
		other.tabIndex = selected ? 0 : -1;
		panelOf(other).hidden = selected ? false : 'until-found';
	}
	if (focus) tab.focus();
	if (scrollToTop) panels.scrollTop = 0;
	try {
		localStorage.setItem(TAB_STORAGE_KEY, tab.id);
	} catch (error) {
		//storage may be unavailable; the popup then always opens on the first tab
	}
}

tabButtons.forEach(tab => {
	tab.addEventListener('click', () => selectTab(tab, { scrollToTop: true }));
	//find-in-page reveals a hidden="until-found" panel; select its tab to match
	panelOf(tab).addEventListener('beforematch', () => selectTab(tab));
});

document.querySelector('[role="tablist"]').addEventListener('keydown', event => {
	const index = tabButtons.indexOf(document.activeElement);
	if (index < 0) return;
	const target = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabButtons.length - 1 }[event.key];
	if (target === undefined) return;
	event.preventDefault();
	selectTab(tabButtons[(target + tabButtons.length) % tabButtons.length], { focus: true, scrollToTop: true });
});

function restoreTab() {
	let id = null;
	try {
		id = localStorage.getItem(TAB_STORAGE_KEY);
	} catch (error) {
		//see selectTab
	}
	const tab = tabButtons.find(button => button.id === id);
	if (tab) selectTab(tab);
}

//custom values for the font and small player size selects (the last option holds the custom value)
function setupCustomValue(select, form) {
	const customOption = select.querySelector('option:last-child');
	const input = form.querySelector('input');

	function sync() {
		form.hidden = !customOption.selected;
		if (customOption.selected && customOption.value !== CUSTOM) input.value = customOption.value;
	}

	select.addEventListener('change', () => {
		sync();
		if (customOption.selected) input.focus();
	});
	form.addEventListener('submit', event => {
		event.preventDefault();
		const value = input.value.trim();
		if (value === '') return;
		customOption.value = value;
		saveSettings();
	});
	return sync;
}

const syncPlayerWidth = setupCustomValue(playerWidthSelect, document.querySelector('#player-size-custom'));
const syncTitleFont = setupCustomValue(titleFontSelect, document.querySelector('#title-font-custom'));

function selectValue(select, value) {
	select.value = value;
	if (select.value === '') {
		const customOption = select.querySelector('option:last-child');
		customOption.value = value;
		customOption.selected = true;
	}
}

//reset
document.querySelector('#restore-defaults').addEventListener('click', () => {
	restoreDialog.showModal();
});

restoreDialog.addEventListener('close', async() => {
	const choice = restoreDialog.returnValue;
	restoreDialog.returnValue = '';
	if (choice !== 'restore') return;
	await storage.clear();
	const tabs = await browser.tabs.query({active: true, currentWindow: true});
	if (tabs[0]) browser.tabs.reload(tabs[0].id);
	window.close();
});

//export/import config
document.querySelector('#export-config').addEventListener('click', () => {
	browser.tabs.create({ url: './config.html' });
});

/* Visibility switches are on while the feature is shown, so they store the inverse (hide*) of their state. */
function readCheckbox(element) {
	return 'invert' in element.dataset ? !element.checked : element.checked;
}

function saveSettings() {
	const newSettings = { ...currentSettings };
	newSettings[slider.name] = slider.value;

	document.querySelectorAll('input[type="checkbox"].settings').forEach(element => {
		newSettings[element.name] = readCheckbox(element);
	});

	document.querySelectorAll('select.settings').forEach(element => {
		//"Custom..." picked but no value applied yet: keep the previous value
		newSettings[element.name] = element.value === CUSTOM ? currentSettings[element.name] : element.value;
	});

	document.querySelectorAll('input[type="radio"].settings:checked').forEach(element => {
		newSettings[element.name] = element.value;
	});

	storage.set({reduxSettings: newSettings});
	currentSettings = newSettings;
}

function getSettings() {
	slider.value = currentSettings.gridItems;
	sliderControl.value = slider.value;

	document.querySelectorAll('input[type="checkbox"].settings').forEach(element => {
		if (!(element.name in currentSettings)) return;
		const value = !!currentSettings[element.name];
		element.checked = 'invert' in element.dataset ? !value : value;
	});

	selectValue(playerWidthSelect, String(currentSettings.smallPlayerWidth ?? 853));
	selectValue(titleFontSelect, String(currentSettings.titleFontValue ?? 'Arial'));
	languageSelect.value = currentSettings.language in reduxMessages ? currentSettings.language : 'auto';
	syncPlayerWidth();
	syncTitleFont();

	for (const name of ['favicon', 'classicLogoChoice']) {
		const radio = document.querySelector(`input[type="radio"][name="${name}"][value="${currentSettings[name]}"]`);
		if (radio) radio.checked = true;
	}

	//enable the subsettings of settings that are on
	document.querySelectorAll('input[type="checkbox"].settings:checked').forEach(setting => {
		getSubsettings(setting).forEach(element => element.removeAttribute('disabled'));
	});
}

function calculateSizeOptions() {
	playerWidthSelect.querySelectorAll('option').forEach(element => {
		if (element.matches(':last-child')) {
			element.textContent = t('custom');
		} else {
			element.textContent = `${element.value} × ${Math.ceil(element.value / 1.78)} px`; //fixed at 16:9
		}
	});
}

function applyLanguage() {
	setLanguage(languageSelect.value);
	localizePage();
	calculateSizeOptions();
}

//main
restoreTab();
loadSettings().then(settings => {
	currentSettings = settings;
	getSettings();
	applyLanguage();
});
