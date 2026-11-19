// Adds a release to updates.json, the update manifest Firefox polls through the extension's update_url.
// Usage: node .github/scripts/update-manifest.mjs <version> <xpi url> <xpi file>
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const [version, updateLink, xpiFile] = process.argv.slice(2);
if (!version || !updateLink || !xpiFile) {
	console.error('usage: update-manifest.mjs <version> <xpi url> <xpi file>');
	process.exit(1);
}

const gecko = JSON.parse(readFileSync('manifest.json', 'utf8')).browser_specific_settings.gecko;
const manifest = JSON.parse(readFileSync('updates.json', 'utf8'));
const addon = (manifest.addons[gecko.id] ??= { updates: [] });

const entry = {
	version,
	update_link: updateLink,
	update_hash: `sha256:${createHash('sha256').update(readFileSync(xpiFile)).digest('hex')}`
};
if (gecko.strict_min_version) {
	entry.applications = { gecko: { strict_min_version: gecko.strict_min_version } };
}

// re-running a release replaces its entry instead of duplicating it
addon.updates = addon.updates.filter(update => update.version !== version).concat(entry);
writeFileSync('updates.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`updates.json: ${gecko.id} -> ${version}`);
