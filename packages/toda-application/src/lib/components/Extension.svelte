<script lang="ts" module>
	import { query } from '$lib/hypergraphsql.js';
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

		let node_edges = await query('test.db', 'node_edge', {
			'from_node.data': { age: { eq: 31 } },
			'edge.uri': { eq: 'married' }
		});

		console.log(node_edges);
	}

	$effect(() => {
		handleMount();
	});
</script>

<div bind:this={element} title={context.id} class="h-full w-full overflow-hidden"></div>
