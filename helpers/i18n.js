/* Extension language handling. The language is a user setting ('auto' | 'en' | 'id'), so translations
   live here instead of _locales, which always follows the browser's UI language.
   This file only carries the few strings injected into YouTube pages; helpers/i18n-ui.js adds the
   strings of the extension pages. */
const reduxMessages = {
	en: {
		showMore: 'Show more',
		addTo: 'Add to',
		publishedOn: 'Published on '
	},
	id: {
		showMore: 'Tampilkan lebih banyak',
		addTo: 'Tambahkan ke',
		publishedOn: 'Dipublikasikan pada '
	}
};

let reduxLanguage = 'en';

/* 'auto' follows the given hint (e.g. the page language) and falls back to the browser's UI language. */
function resolveLanguage(choice, hint) {
	if (choice && choice !== 'auto' && reduxMessages[choice]) return choice;
	const candidate = String(hint || browser.i18n.getUILanguage() || navigator.language || 'en').toLowerCase();
	return /^(id|in)\b/.test(candidate) ? 'id' : 'en';
}

function setLanguage(choice, hint) {
	reduxLanguage = resolveLanguage(choice, hint);
	return reduxLanguage;
}

function t(key, ...substitutions) {
	const message = reduxMessages[reduxLanguage][key] ?? reduxMessages.en[key] ?? key;
	return substitutions.length ? message.replace(/\$(\d)/g, (match, index) => substitutions[index - 1] ?? '') : message;
}
