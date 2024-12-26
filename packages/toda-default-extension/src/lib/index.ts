import type { ExtensionContext } from '@toda/core';
import DefaultComponent from '$lib/components/Default.svelte';
import { mount, unmount } from 'svelte';

export default async function defaultExtension(context: ExtensionContext) {
	console.log(`Extension ${context.id} activated`);

	context.onMount((target) => {
		const component = mount(DefaultComponent, { target });
		return () => {
			unmount(component);
		};
	});

	context.subscriptions.push(() => {
		console.log(`Extension ${context.id} deactivated`);
	});
}
