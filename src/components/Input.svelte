<script>
	import debounce from 'lodash/debounce';

	export let components;
	export let active;

	$: component = components[active];

	const handleInput = debounce((e) => {
		components[active].source = e.target.value;
	}, 800);

	const handleKeydown = (e) => {
		if (e.key === 'Tab') {
			e.preventDefault();
			const textarea = e.target;
    		textarea.setRangeText(
				'\t',
				textarea.selectionStart,
				textarea.selectionStart,
				'end'
			);
		}
	}
</script>

<section class='input'>
	<h3>{component.name}.{component.type}</h3>
	<textarea
		value={component.source}
		on:input={handleInput}
		on:keydown={handleKeydown} />
</section>

<style lang='scss'>
	.input {
		flex: 1;

		textarea {
			width: 100%;
			height: 100%;
			font-family: 'Fira Code', monospace;
			tab-size: 4;
		}
	}
</style>
