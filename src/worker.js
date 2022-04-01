import * as rollup from 'rollup/dist/es/rollup.browser.js';

const CDN_URL = 'https://unpkg.com';
importScripts(`${CDN_URL}/svelte/compiler.js`);

const generateLookupTable = (components) => {
	return new Map(components.map((component) => [
		`./${component.name}.${component.type}`,
		component
	]));
}

const fetchPackage = async (url) => {
	return fetch(url).then((r) => r.text());
}


self.addEventListener('message', async (e) => {
	const componentsLookupTable = generateLookupTable(e.data);

	const bundle = await rollup.rollup({
		input: './App.svelte',
		plugins: [
			{
				name: 'my-repl',
				async resolveId(importee, importer) {
					// e.g. import { onMount } from 'svelte';
					if (importee === 'svelte') {
						return `${CDN_URL}/svelte/index.mjs`;
					}

					// e.g. import { writable } from 'svelte/store';
					if (importee.startsWith('svelte/')) {
						return `${CDN_URL}/svelte/${importee.slice(7)}/index.mjs`;
					}

					// // import x from './file.js' (via a 'svelte' or 'svelte/x' package)
					// if (importer && importer.startsWith(`${CDN_URL}/svelte`)) {
					// 	const resolved = new URL(importee, importer).href;
					// 	if (resolved.endsWith(".mjs")) return resolved;
					// 	return `${resolved}/index.mjs`;
					// }

					// Local REPL component
					if (componentsLookupTable.has(importee)) {
						return importee;
					}

					// Relative import from a NPM package
					if (importee.startsWith('.')) {
						return new URL(importee, importer).href;
					}

					// NPM package, e.g. import { max } from 'd3-array';
					const pkg = JSON.parse((await fetchPackage(`${CDN_URL}/${importee}/package.json`)));
					const entryPoint = pkg.svelte || pkg.module || pkg.main;
					
					if (entryPoint) {
						self.postMessage({
							type: 'STATUS',
							message: `Resolving ${importee}...`,
						});
						return [CDN_URL, importee, entryPoint].join('/');
					}
					return importee;
				},
				async load(id) {
					if (componentsLookupTable.has(id)) {
						return componentsLookupTable.get(id).source;
					}

					return fetchPackage(id);
				},
				transform(code, id) {
					// Compile component
					if (/.*\.svelte/.test(id)) {
						self.postMessage({
							type: 'STATUS',
							message: `Compiling ${id}...`
						});
						return svelte.compile(code).js.code;
					}
				},
			}
		]
	});

	const output = (await bundle.generate({ format: 'esm' })).output[0].code;
	self.postMessage(output);
});