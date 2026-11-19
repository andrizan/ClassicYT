# YouTubeRedux

Firefox extension that focuses on replicating old YouTube layout within Polymer design (modern layout).

This is a Firefox-only fork of [omnidevZero/YouTubeRedux](https://github.com/omnidevZero/YouTubeRedux) (Firefox 128 or newer). It is distributed from this repository instead of addons.mozilla.org and updates itself from here.

## Install

Download the `.xpi` of the latest [release](https://github.com/andrizan/YouTubeRedux/releases) and open it in Firefox.

The fork has its own add-on ID, so it installs next to the addons.mozilla.org version instead of replacing it. Remove that one first; settings can be carried over with the export/import button in the settings popup.

## Updates

`manifest.json` points Firefox at [`updates.json`](updates.json) in this repository (`update_url`). Firefox checks it about once a day and installs newer releases on its own. To check right away open `about:addons`, click the gear icon and pick *Check for Updates*.

## Language

The extension's own pages and the few strings it adds to YouTube are available in English and Bahasa Indonesia. Pick the language in the top-left corner of the settings popup; *Auto* follows the browser (and, on YouTube, the language of the page). Translations live in `helpers/i18n.js` and `helpers/i18n-ui.js`.

## Development

Load the repository root as a temporary add-on (`about:debugging` → *This Firefox* → *Load Temporary Add-on…* → `manifest.json`) or run it with [web-ext](https://github.com/mozilla/web-ext):

```
npx web-ext run
npx web-ext lint --self-hosted
```

| File | Purpose |
| --- | --- |
| `styles.css` | styles that are always applied |
| `initial-setup.js` | loads the settings and injects the styles of the enabled settings (`document_start`) |
| `main.js` | page changes that need scripting (`document_idle`) |
| `helpers/settings.js` | default settings, shared by the content scripts and the extension pages |
| `popup.*`, `config.*`, `changelog.*` | settings popup, export/import page, changelog page |

## Releasing

1. Bump `version` in `manifest.json` and describe the changes in `changelog.html`.
2. Commit, then tag the commit `v<version>` and push the tag.

The [release workflow](.github/workflows/release.yml) lints the extension, has it signed by Mozilla as an unlisted add-on, attaches the `.xpi` to a GitHub release and adds the release to `updates.json`.

Signing needs two repository secrets, `AMO_JWT_ISSUER` and `AMO_JWT_SECRET`, created at [addons.mozilla.org → Tools → Manage API Keys](https://addons.mozilla.org/developers/addon/api/key/). Without them the workflow publishes an unsigned build, which only Firefox Developer Edition, Nightly and ESR can install (with `xpinstall.signatures.required` set to `false`).
