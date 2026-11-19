const exportArea = document.querySelector('#export-button-clipboard textarea');
const importArea = document.querySelector('#import-button-clipboard textarea');
const fileInput = document.querySelector('#import-button-file input');

function showAlert(text) {
	document.querySelector('#alert')?.remove();

	const alert = document.createElement('div');
	alert.id = 'alert';
	alert.innerText = text;
	document.body.append(alert);
	alert.classList.add('show-alert');

	setTimeout(() => {
		alert.classList.remove('show-alert');
	}, 5000);
}

/* Stores an imported config; returns false when the data isn't a settings object. */
function importConfig(data) {
	let parsed;
	try {
		parsed = JSON.parse(data);
	} catch (error) {
		parsed = null;
	}
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		showAlert(t('alertInvalidConfig'));
		return false;
	}

	const { settings } = withDefaults(parsed);
	storage.set({reduxSettings: settings});
	exportArea.value = JSON.stringify(settings, null, 2);
	return true;
}

//export to file
document.querySelector('#export-button-file').addEventListener('click', async() => {
	const granted = await browser.permissions.request({ permissions: ['downloads'] });
	if (granted) {
		browser.downloads.download({
			url: URL.createObjectURL(new Blob([exportArea.value], { type: "application/json" })),
			filename: `ClassicYT_config_${new Date().toISOString().replaceAll(":", "-")}.json`,
			saveAs: true
		});
	} else {
		showAlert(t('alertPermissionDenied'));
	}
});

//export to clipboard
document.querySelector('#export-button-clipboard .copy-paste-btn').addEventListener('click', () => {
	navigator.clipboard.writeText(exportArea.value);
	showAlert(t('alertCopied'));
});

//import from file
document.querySelector('#import-button-file').addEventListener('click', () => {
	fileInput.click();
});
fileInput.addEventListener('click', event => event.stopPropagation());
fileInput.addEventListener('change', async() => {
	const file = fileInput.files[0];
	if (!file) return;
	if (importConfig(await file.text())) {
		showAlert(t('alertImportedFile'));
	}
	fileInput.value = '';
});

//import from clipboard
document.querySelector('#import-button-clipboard .copy-paste-btn').addEventListener('click', () => {
	if (importConfig(importArea.value)) {
		showAlert(t('alertImportedClipboard'));
	}
});

loadSettings().then(settings => {
	setLanguage(settings.language);
	localizePage();
	exportArea.value = JSON.stringify(settings, null, 2);
});
