const REPOSITORY_URL = 'https://github.com/andrizan/YouTubeRedux';
const DONATE_URL = 'https://www.paypal.com/donate?hosted_button_id=MD9WRXSTLB49W';
const allPages = document.querySelector('#all-pages');
const leftArrow = document.querySelector('#left-arrow');
const rightArrow = document.querySelector('#right-arrow');
const slider = document.querySelector('input[type="range"]');
const sliderControl = document.querySelector('.slider-control');
const playerWidthSelect = document.querySelector('select[name="smallPlayerWidth"]');
const titleFontSelect = document.querySelector('select[name="titleFontValue"]');
const languageSelect = document.querySelector('select[name="language"]');
let currentSettings;

document.querySelector('#version').textContent = `v${browser.runtime.getManifest().version}`;

document.querySelector('#donate').onclick = function() {
	window.open(DONATE_URL);
};

document.querySelector('#github-button').onclick = function() {
	window.open(REPOSITORY_URL);
};

function getSubsettings(setting) {
	const container = setting.parentElement.nextElementSibling;
	if (container == null || !container.classList.contains('subsettings-container')) return [];
	return container.querySelectorAll('.subsetting input[type="checkbox"]');
}

document.querySelectorAll('.settings:not(.slider-control)').forEach(setting => {
	setting.addEventListener('change', function() {
		getSubsettings(this).forEach(element => {
			if (this.checked) {
				element.removeAttribute('disabled');
			} else {
				element.setAttribute('disabled', '');
				element.checked = false;
			}
		});
		saveSettings();
	});
});

slider.addEventListener('change', function() {
	sliderControl.value = this.value;
	saveSettings();
});

sliderControl.addEventListener('change', function() {
	slider.value = this.value;
	saveSettings();
});

languageSelect.addEventListener('change', applyLanguage);

//navigation buttons
function showPage(page) {
	allPages.setAttribute('active-page', page);
	allPages.style.transform = `translateX(-${(page - 1)*100}%)`;
	leftArrow.toggleAttribute('disabled', page <= 1);
	rightArrow.toggleAttribute('disabled', page >= 3);
}

rightArrow.addEventListener('click', function() {
	if (this.hasAttribute('disabled')) {
		return;
	}

	const page = Number(allPages.getAttribute('active-page')) + 1;
	showPage(page);

	if (page >= 3 && !currentSettings.completedSettingsTutorial) {
		document.querySelector("input[name='completedSettingsTutorial']").checked = true;
		this.classList.remove("glow");
		saveSettings();
	}
});

leftArrow.addEventListener('click', function() {
	if (this.hasAttribute('disabled')) {
		return;
	}

	showPage(Number(allPages.getAttribute('active-page')) - 1);
});

//custom values for the font and small player size selects (the last option holds the custom value)
function askForCustomValue(select, message, suggestion) {
	const customOption = select.querySelector('option:last-child');
	if (!customOption.selected) return;
	const choice = prompt(message, suggestion);
	if (choice != null && choice.trim() !== '') {
		customOption.value = choice.trim();
		saveSettings();
	}
}

function selectValue(select, value) {
	select.value = value;
	if (select.value === '') {
		const customOption = select.querySelector('option:last-child');
		customOption.value = value;
		customOption.selected = true;
	}
}

titleFontSelect.addEventListener('change', function() {
	askForCustomValue(this, t('promptFont'), '\'Times New Roman\'');
});

playerWidthSelect.addEventListener('change', function() {
	askForCustomValue(this, t('promptPlayerWidth'), '900');
});

//logo preview
document.querySelectorAll('label.logo-label').forEach(element => {
	const preview = document.querySelector('.logo-preview');
	element.addEventListener('mouseenter', function() {
		const logo = this.firstChild.value;
		preview.querySelector('img').src = `/images/${logo}logo.${logo == 'XL' ? 'png' : 'svg'}`;
		preview.style.display = 'flex';
	});
	element.addEventListener('mouseleave', function() {
		preview.style.display = 'none';
	});
});

//reset
document.querySelector('#restore-defaults').addEventListener('click', async() => {
	if (!confirm(t('confirmRestore'))) return;
	await storage.clear();
	const tabs = await browser.tabs.query({active: true, currentWindow: true});
	if (tabs[0]) browser.tabs.reload(tabs[0].id);
	window.close();
});

//export/import config
document.querySelector('#export-config').addEventListener('click', () => {
	browser.tabs.create({ url: './config.html' });
});

function saveSettings() {
	const newSettings = { ...currentSettings };
	newSettings[slider.name] = slider.value;

	document.querySelectorAll('input[type="checkbox"]').forEach(element => {
		newSettings[element.name] = element.checked;
	});

	document.querySelectorAll('select').forEach(element => {
		newSettings[element.name] = element.value;
	});

	document.querySelectorAll('input[type="radio"]:checked').forEach(element => {
		newSettings[element.name] = element.value;
	});

	storage.set({reduxSettings: newSettings});
	currentSettings = newSettings;
}

function getSettings() {
	slider.value = currentSettings.gridItems;
	sliderControl.value = currentSettings.gridItems;

	document.querySelectorAll('input[type="checkbox"]').forEach(element => {
		if (element.name in currentSettings) element.checked = !!currentSettings[element.name];
	});

	selectValue(playerWidthSelect, String(currentSettings.smallPlayerWidth ?? 853));
	selectValue(titleFontSelect, String(currentSettings.titleFontValue ?? 'Arial'));
	languageSelect.value = currentSettings.language in reduxMessages ? currentSettings.language : 'auto';

	for (const name of ['favicon', 'classicLogoChoice']) {
		const radio = document.querySelector(`input[type="radio"][name="${name}"][value="${currentSettings[name]}"]`);
		if (radio) radio.checked = true;
	}

	//enable subsettings of checked settings
	document.querySelectorAll('.settings:not(.slider-control)').forEach(setting => {
		if (!setting.checked) return;
		getSubsettings(setting).forEach(element => element.removeAttribute('disabled'));
	});
}

function calculateSizeOptions() {
	playerWidthSelect.querySelectorAll('option').forEach(element => {
		if (element.matches(':last-child')) {
			element.textContent = t('custom');
		} else {
			element.textContent = `${element.value}x${Math.ceil(element.value / 1.78)}px`; //fixed at 16:9
		}
	});
}

function applyLanguage() {
	setLanguage(languageSelect.value);
	localizePage();
	calculateSizeOptions();
}

//main
loadSettings().then(settings => {
	currentSettings = settings;
	getSettings();
	applyLanguage();

	if (!currentSettings.completedSettingsTutorial) {
		rightArrow.classList.add("glow");
	}
});
