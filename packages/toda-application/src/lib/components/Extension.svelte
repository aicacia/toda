<script lang="ts" module>
	import type { ExtensionContext } from '@toda/core';
	import { onMount } from 'svelte';

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

	onMount(handleMount);
</script>

<div
	bind:this={element}
	title="{context.name}@{context.version}: {context.description}"
	class="h-full w-full overflow-hidden"
></div>
