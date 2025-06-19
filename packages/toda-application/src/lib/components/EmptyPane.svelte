<script lang="ts" module>
	import * as m from '$lib/paraglide/messages';
	import { extensions } from '$lib/stores/extensions.svelte';
	import type { BasePaneProps } from './Pane.svelte';

	const mountableExtensions = $derived(
		Object.values(extensions).filter((e) => !!e.config.packageJSON.view)
	);

	export interface EmptyPaneProps extends BasePaneProps {
		onSetExtension(name?: string): void;
	}
</script>

<script lang="ts">
	let { onSetExtension }: EmptyPaneProps = $props();

	let extension = $state<string | undefined>();
	function onChangeExtension() {
		onSetExtension(extension);
	}
</script>

<div class="relative flex flex-grow flex-col items-center justify-center">
	<select bind:value={extension} onchange={onChangeExtension}>
		<option value={undefined}>{m.pane_extension_placeholder()}</option>
		{#each mountableExtensions as extension (extension.config.packageJSON.name)}
			<option value={extension.config.packageJSON.name}
				>{extension.config.packageJSON.description}</option
			>
		{/each}
	</select>
</div>
