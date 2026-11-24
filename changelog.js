function handleChangelog() {
	const changelogHeader = document.querySelector('#youtube-redux-header');
	const { name, version } = browser.runtime.getManifest();
	if (!changelogHeader) return;
	if (window.location.href.includes('#install')) {
		changelogHeader.innerText = t('changelogInstalled', name);
	} else {
		changelogHeader.innerText = t('changelogUpdated', name, version);
	}
}

function addShowMore() {
	const updatesToDisplay = 3;
	let counter = 0;
	let changesContainer = document.querySelector('#changes ul');
	let showMoreButton = document.createElement('button');
	showMoreButton.type = 'button';
	showMoreButton.classList.add('show-more', 'btn');
	showMoreButton.dataset.i18n = 'showMoreDots';
	showMoreButton.addEventListener('click', function () {
		for (let i = 0; i < changesContainer.children.length; i++) {
			changesContainer.children[i].removeAttribute('hidden');
		}
		this.remove();
	});


	for (let i = 0; i < changesContainer.children.length; i++) {
		const currentElement = changesContainer.children[i];
		const showMoreElement = document.querySelector('.show-more');
		if (currentElement.classList && currentElement.classList.contains('update')) counter++;
		if (!showMoreElement && counter > updatesToDisplay) {
			changesContainer.insertBefore(showMoreButton, currentElement);
		}
		if (showMoreElement) {
			currentElement.setAttribute('hidden', '');
		}
	}
}

addShowMore();

loadSettings().then(settings => {
	setLanguage(settings.language);
	localizePage();
	handleChangelog();

	const changelogToggle = document.querySelector('input[name="showChangelog"]');
	changelogToggle.checked = settings.showChangelog ? true : false;
	changelogToggle.addEventListener('change', function() {
		settings.showChangelog = this.checked;
		storage.set({ reduxSettings: settings });
	});
});

document.querySelector('.point-link').addEventListener('click', () => {
	document.querySelector('.pointer').style.display = 'block';
});
