<script>
	import outdent from 'outdent';

	import { Input, Output } from './components';

	let components = [
		{
			id: 0,
			name: 'App',
			type: 'svelte',
			source: outdent`
				<script>
					import { min, max } from 'd3-array';

					let count = 0;

					const array = [
						{
							id: 0,
							nb: 42
						},
						{
							id: 1,
							nb: 24
						},
						{
							id: 2,
							nb: 101
						},
						{
							id: 0,
							nb: -17
						}
					];

					console.log(min(array, (d) => d.nb), max(array, (d) => d.nb));
				<\/script>

				<p>Count: {count}</p>
				<button on:click={() => count++}>
					Click me!
				</button>
			`
		}
	];

	let active = 0;
	let compiled;
	let status;
	let error;

	const worker = new Worker('./worker.js');
	worker.addEventListener('message', (e) => {
		if (e.data.type === 'STATUS') {
			status = e.data.message;
		}
		else if (e.data.type === 'ERROR') {
			error = e.data.message;
		}
		else {
			status = null;
			error = null;
			compiled = e.data;
		}
	});

	const compile = (_components) => {
		worker.postMessage(_components);
	}

	$: compile(components);
</script>

<main>
	<Input bind:components bind:active />
	<Output {compiled} {status} {error} />
</main>

<style lang='scss'>
	@import './global.scss';

	main {
		width: 100%;
		max-width: 64rem;
		margin: 1rem auto;
		display: flex;
		height: 20rem;
	}
</style>
