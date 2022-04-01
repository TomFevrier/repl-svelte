
<script>
	import outdent from 'outdent';
	// import srcdoc from './srcdoc/index.html?raw';

	const srcdoc = outdent`
		<!DOCTYPE html>
		<html>
			<head>
				<script type='module'>
					let component;

					const update = (source) => {
						console.log(source)
						const blob = new Blob([source], { type: 'text/javascript' });
						const url = URL.createObjectURL(blob);

						import(url).then(({ default: App }) => {
							if (component) {
								component.$destroy();
							}
							document.body.innerHTML = '';
							component = new App({
								target: document.body
							});
						})
					}

					window.addEventListener('message', (e) => {
						update(e.data)
					}, false);
				<\/script>
			</head>
			<body></body>
		</html>
	`;

	export let compiled;
	export let status;
	export let error;

	let iframe;
	$: iframe && compiled && iframe.contentWindow.postMessage(compiled, '*');
</script>

<section class='output'>
	<iframe title='Résultat' bind:this={iframe} {srcdoc} />
	{#if status}
		<p class='status'>{status}</p>
	{/if}
	{#if error}
		<p class='error'>{error}</p>
	{/if}
</section>

<style lang='scss'>
	.output {
		flex: 1;

		iframe {
			width: 100%;
			height: 100%;
		}

		.status {
			color: goldenrod;
		}

		.error {
			color: firebrick;
		}
	}
</style>