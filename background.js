/* Event page: shows the changelog right after an install and, after an update, the next time YouTube is visited. */
function openChangelog(reason) {
	browser.tabs.create({
		url: `./changelog.html#${reason}`
	});
}

async function showQueuedChangelog() {
	const { reduxSettings } = await browser.storage.sync.get('reduxSettings');
	await browser.storage.sync.set({ queueDisplayChangelog: false });
	if (!reduxSettings || reduxSettings.showChangelog) {
		openChangelog('update');
	}
}

browser.runtime.onInstalled.addListener(details => {
	if (details.reason === 'install') {
		browser.storage.sync.set({ queueDisplayChangelog: false });
		openChangelog('install');
	} else if (details.reason === 'update') {
		browser.storage.sync.set({ queueDisplayChangelog: true });
	}
});

browser.runtime.onMessage.addListener(request => {
	if (request.message === 'displayChangelog') {
		showQueuedChangelog();
	}
});
