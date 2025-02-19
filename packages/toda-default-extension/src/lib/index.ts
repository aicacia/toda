import { type ExtensionContext } from '@toda/core';
import DefaultComponent from '$lib/components/Default.svelte';
import { mount, unmount } from 'svelte';

export default async function defaultExtension(context: ExtensionContext) {
	console.log(`Extension ${context.name}@${context.version} activated`);

	context.onMount(async (target) => {
		const result = await context.hypergraph.query('node_edge', {
			'edge.uri': { eq: 'married' }
		});
		console.log(result);

		const component = mount(DefaultComponent, { target });
		return () => {
			unmount(component);
		};
	});

	context.subscriptions.push(() => {
		console.log(`Extension ${context.name}@${context.version} deactivated`);
	});
}
