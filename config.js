const SVG_NS = 'http://www.w3.org/2000/svg';
const TOAST_DURATION = 5000;
const exportArea = document.querySelector('#export-area');
const importArea = document.querySelector('#import-area');
const fileInput = document.querySelector('#import-file');
const toastRegion = document.querySelector('#toasts');
const announcer = document.querySelector('#announcer');

function announce(text) {
	if (typeof document.ariaNotify === 'function') {
		document.ariaNotify(text);
	} else {
		announcer.textContent = text;
	}
}

function closeIcon() {
	const svg = document.createElementNS(SVG_NS, 'svg');
	svg.setAttribute('class', 'icon');
	svg.setAttribute('aria-hidden', 'true');
	const use = document.createElementNS(SVG_NS, 'use');
	use.setAttribute('href', '#i-close');
	svg.append(use);
	return svg;
}

/* Shows a status message that hides itself after a while (not while it has focus).
   Every outcome is also visible on the page itself, e.g. the export box changes after an import. */
function showAlert(text) {
	const previousFocus = document.activeElement;
	toastRegion.replaceChildren();

	const toast = document.createElement('div');
	toast.className = 'toast';
	toast.setAttribute('popover', 'manual');
	const message = document.createElement('span');
	message.textContent = text;
	const closeButton = document.createElement('button');
	closeButton.type = 'button';
	closeButton.className = 'icon-btn';
	closeButton.title = t('close');
	closeButton.setAttribute('aria-label', t('close'));
	closeButton.append(closeIcon());
	toast.append(message, closeButton);
	toastRegion.append(toast);
	toast.showPopover();
	announce(text);

	let timer;
	const dismiss = () => {
		clearTimeout(timer);
		if (toast.isConnected) toast.hidePopover();
		setTimeout(() => toast.remove(), 300);
	};
	const scheduleDismiss = () => {
		timer = setTimeout(() => {
			if (toast.matches(':focus-within')) scheduleDismiss();
			else dismiss();
		}, TOAST_DURATION);
	};
	closeButton.addEventListener('click', () => {
		dismiss();
		previousFocus?.focus?.();
	});
	scheduleDismiss();
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
document.querySelector('#export-file-button').addEventListener('click', async() => {
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
document.querySelector('#copy-button').addEventListener('click', async() => {
	try {
		await navigator.clipboard.writeText(exportArea.value);
		showAlert(t('alertCopied'));
	} catch (error) {
		//clipboard unavailable: select the text so it can be copied by hand
		exportArea.focus();
		exportArea.select();
	}
});

//import from file
document.querySelector('#import-file-button').addEventListener('click', () => {
	fileInput.click();
});
fileInput.addEventListener('change', async() => {
	const file = fileInput.files[0];
	if (!file) return;
	if (importConfig(await file.text())) {
		showAlert(t('alertImportedFile'));
	}
	fileInput.value = '';
});

//import from the text box
document.querySelector('#import-button').addEventListener('click', () => {
	if (importConfig(importArea.value)) {
		showAlert(t('alertImportedClipboard'));
	}
});

loadSettings().then(settings => {
	setLanguage(settings.language);
	localizePage();
	exportArea.value = JSON.stringify(settings, null, 2);
});
