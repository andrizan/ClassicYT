// The extension lives in the repository root, so everything that isn't part of it has to be listed here.
// Dotfiles (.github, .gitignore, this file) are left out by web-ext on its own.
export default {
	ignoreFiles: [
		'README.md',
		'updates.json',
		'dist',
		'web-ext-artifacts'
	]
};
