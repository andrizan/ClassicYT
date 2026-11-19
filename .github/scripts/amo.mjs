// addons.mozilla.org (AMO) API helper for the release workflow.
//
//   node .github/scripts/amo.mjs listing [--dry-run]
//       updates the store listing from .github/amo/listing.json
//   node .github/scripts/amo.mjs metadata <version> <out.json>
//       writes the --amo-metadata file for `web-ext sign` (license and release notes from changelog.html)
//   node .github/scripts/amo.mjs download <version> <dir> [--wait-minutes N]
//       waits until Mozilla approved the version, then downloads its signed file to <dir>/classicyt-<version>.xpi
//       (writes state=public|pending and file=<path> to $GITHUB_OUTPUT when running in GitHub Actions)
//
// Credentials come from AMO_JWT_ISSUER and AMO_JWT_SECRET and are never printed.
import { createHmac, randomUUID } from 'node:crypto';
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const LICENSE = 'MIT';
const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
const guid = manifest.browser_specific_settings.gecko.id;
const addonUrl = `https://addons.mozilla.org/api/v5/addons/addon/${encodeURIComponent(guid)}/`;

const encode = value => Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)).toString('base64url');

function authorization() { // a fresh short-lived token for every request
	const { AMO_JWT_ISSUER: issuer, AMO_JWT_SECRET: secret } = process.env;
	if (!issuer || !secret) throw new Error('AMO_JWT_ISSUER and AMO_JWT_SECRET must be set');
	const now = Math.floor(Date.now() / 1000);
	const unsigned = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ iss: issuer, jti: randomUUID(), iat: now, exp: now + 60 })}`;
	return `JWT ${unsigned}.${createHmac('sha256', secret).update(unsigned).digest('base64url')}`;
}

async function api(method, url, body) {
	const headers = { Authorization: authorization() };
	if (body !== undefined) headers['Content-Type'] = 'application/json';
	const response = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
	const text = await response.text();
	if (!response.ok) {
		const error = new Error(`${method} ${url} -> ${response.status}: ${text.slice(0, 1000)}`);
		error.status = response.status;
		throw error;
	}
	return text ? JSON.parse(text) : null;
}

function output(values) {
	if (!process.env.GITHUB_OUTPUT) return;
	appendFileSync(process.env.GITHUB_OUTPUT, Object.entries(values).map(([key, value]) => `${key}=${value}\n`).join(''));
}

const decodeEntities = text => text
	.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

/* The <li> items of the version's entry in changelog.html, as plain text. */
function releaseNotes(version) {
	const html = readFileSync('changelog.html', 'utf8');
	const marker = `<div class="update"><div>${version}</div>`;
	const start = html.indexOf(marker);
	if (start < 0) throw new Error(`changelog.html has no entry for ${version}`);
	const end = html.indexOf('<div class="update">', start + marker.length);
	const block = html.slice(start, end < 0 ? undefined : end);
	const items = [...block.matchAll(/<li>([\s\S]*?)<\/li>/g)]
		.map(match => decodeEntities(match[1].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim())
		.filter(Boolean);
	if (items.length === 0) throw new Error(`the changelog entry for ${version} has no items`);
	return items.map(item => `• ${item}`).join('\n');
}

async function listing(dryRun) {
	const data = JSON.parse(readFileSync('.github/amo/listing.json', 'utf8'));
	if (dryRun) {
		console.log(JSON.stringify(data, null, 2));
		return;
	}
	const addon = await api('PATCH', addonUrl, data);
	console.log('listing updated:', JSON.stringify({ slug: addon.slug, url: addon.url, categories: addon.categories, locales: Object.keys(addon.summary || {}) }));
}

function metadata(version, out) {
	const notes = releaseNotes(version);
	writeFileSync(out, JSON.stringify({ version: { license: LICENSE, release_notes: { 'en-US': notes } } }, null, 2));
	console.log(`release notes for ${version}:\n${notes}`);
}

async function download(version, dir, waitMinutes) {
	const versionUrl = `${addonUrl}versions/v${encodeURIComponent(version)}/`;
	const deadline = Date.now() + waitMinutes * 60 * 1000;
	for (;;) {
		const details = await api('GET', versionUrl);
		const status = details.file?.status;
		console.log(`${new Date().toISOString()} ${version} (${details.channel}): ${status}`);
		if (status === 'public') {
			const response = await fetch(details.file.url, { headers: { Authorization: authorization() } });
			if (!response.ok) throw new Error(`download failed: ${response.status}`);
			mkdirSync(dir, { recursive: true });
			const file = path.join(dir, `classicyt-${version}.xpi`);
			writeFileSync(file, Buffer.from(await response.arrayBuffer()));
			console.log(`downloaded ${file}`);
			output({ state: 'public', file });
			return;
		}
		if (status === 'disabled') {
			throw new Error(`Mozilla did not approve ${version} (status "disabled"); see the version in the Developer Hub`);
		}
		if (Date.now() >= deadline) {
			console.log(`::warning::${version} is still awaiting Mozilla's review. Once it is approved, run the Release workflow manually with version ${version} to publish the signed file on GitHub.`);
			output({ state: 'pending' });
			return;
		}
		await new Promise(resolve => setTimeout(resolve, 60 * 1000));
	}
}

const [command, ...args] = process.argv.slice(2);
try {
	if (command === 'listing') {
		await listing(args.includes('--dry-run'));
	} else if (command === 'metadata' && args.length === 2) {
		metadata(args[0], args[1]);
	} else if (command === 'download' && args.length >= 2) {
		const index = args.indexOf('--wait-minutes');
		await download(args[0], args[1], index >= 0 ? Number(args[index + 1]) : 0);
	} else {
		console.error('usage: amo.mjs listing [--dry-run] | metadata <version> <out.json> | download <version> <dir> [--wait-minutes N]');
		process.exit(1);
	}
} catch (error) {
	console.error(`::error::${error.message}`);
	process.exit(1);
}
