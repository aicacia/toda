<script lang="ts" module>
	import type { ExtensionContext } from '@toda/core';

	export interface ExtensionProps {
		context: ExtensionContext;
	}
</script>

<script lang="ts">
	let { context }: ExtensionProps = $props();

	let element: HTMLElement;
	async function handleMount() {
		await context.mount!(element);
	}

	$effect(() => {
		handleMount();
	});
</script>

<div bind:this={element} title={context.id} class="h-full w-full overflow-hidden"></div>
