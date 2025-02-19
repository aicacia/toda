<script lang="ts" module>
	import * as m from '$lib/paraglide/messages';
	import { extensions } from '$lib/stores/extensions.svelte';

	export interface EmptyPaneProps {
		onSetExtension(name: string): void;
	}
</script>

<script lang="ts">
	let { onSetExtension }: EmptyPaneProps = $props();

	let extension = $state<string | undefined>();
	function onChangeExtension() {
		if (extension) {
			onSetExtension(extension);
		}
	}
</script>

<div class="relative flex flex-grow flex-col items-center justify-center">
	<select bind:value={extension} onchange={onChangeExtension}>
		<option value={undefined}>{m.pane_extension_placeholder()}</option>
		{#each Object.values(extensions) as extension (extension.name)}
			<option value={extension.name}>{extension.description}</option>
		{/each}
	</select>
</div>
