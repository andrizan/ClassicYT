# ClassicYT

Firefox extension that brings the old YouTube layout and features back within the modern (Polymer) design.

ClassicYT is a Firefox-only fork of [YouTube Redux](https://github.com/omnidevZero/YouTubeRedux) by omnidevZero (MIT licensed, see [LICENSE](LICENSE)). It needs Firefox 142 or newer. The repository keeps the name `YouTubeRedux`.

## Install

From addons.mozilla.org: https://addons.mozilla.org/firefox/addon/classicyt/

Each [GitHub release](https://github.com/andrizan/YouTubeRedux/releases) also carries the `.xpi` that Mozilla signed for the store; opening it in Firefox installs the same build.

ClassicYT has its own add-on ID (`classicyt@andrizan.github.io`), so it installs next to YouTube Redux instead of replacing it. Remove YouTube Redux first so the two don't restyle the same page; settings can be carried over with the export/import button in the settings popup.

## Updates

Since 3.14.0 updates are delivered by addons.mozilla.org, whichever way the extension was installed. To check right away open `about:addons`, click the gear icon and pick *Check for Updates*.

The self-hosted 3.13.x builds still point at [`updates.json`](updates.json) in this repository. Every release is added there as well, so those installs move to the store build and from then on update through addons.mozilla.org.

## Language

The extension's own pages and the few strings it adds to YouTube are available in English and Bahasa Indonesia. Pick the language in the top-left corner of the settings popup; *Auto* follows the browser (and, on YouTube, the language of the page). Translations live in `helpers/i18n.js` and `helpers/i18n-ui.js`.

## Development

Load the repository root as a temporary add-on (`about:debugging` → *This Firefox* → *Load Temporary Add-on…* → `manifest.json`) or run it with [web-ext](https://github.com/mozilla/web-ext):

```
npx web-ext run
npx web-ext lint
```

| File | Purpose |
| --- | --- |
| `styles.css` | styles that are always applied |
| `initial-setup.js` | loads the settings and injects the styles of the enabled settings (`document_start`) |
| `main.js` | page changes that need scripting (`document_idle`) |
| `helpers/settings.js` | default settings, shared by the content scripts and the extension pages |
| `popup.*`, `config.*`, `changelog.*` | settings popup, export/import page, changelog page |

## Releasing

1. Bump `version` in `manifest.json` and describe the changes in `changelog.html`; the items of that entry become the release notes on addons.mozilla.org.
2. Commit, then tag the commit `v<version>` and push the tag.

The [release workflow](.github/workflows/release.yml) then:

1. lints the extension and updates the store listing from [`.github/amo/listing.json`](.github/amo/listing.json);
2. submits the version to addons.mozilla.org, where Mozilla reviews it;
3. waits up to an hour for the approval, then attaches the signed `.xpi` to a GitHub release and adds it to `updates.json`.

If the review takes longer, run the *Release* workflow manually (Actions → Release → Run workflow) with the version once Mozilla has approved it.

The listing (summary, description, categories, homepage, slug) is kept in `.github/amo/listing.json` and is written to addons.mozilla.org on every release, so change it there rather than in the Developer Hub. The listing icon is not part of it; it was uploaded once through the API.

The workflow needs two repository secrets, `AMO_JWT_ISSUER` and `AMO_JWT_SECRET`, created at [addons.mozilla.org → Tools → Manage API Keys](https://addons.mozilla.org/developers/addon/api/key/).

## Credits

Based on [YouTube Redux](https://github.com/omnidevZero/YouTubeRedux) by omnidevZero. The donation button in the settings popup still goes to the original author.
