<script lang="ts" module>
	import type { Side } from '$lib/stores/layouts.svelte';
	import type { Component } from 'svelte';

	export interface PaneProps<Props extends Record<string, any> = Record<string, any>> {
		id: string;
		Component: Component<Props, {}, keyof Props>;
		props: Props;
		side?: Side;
	}
</script>

<script lang="ts">
	type T = $$Generic<Record<string, any>>;

	let { Component, props, id, side }: PaneProps<T> = $props();
</script>

<div class="pane relative flex flex-grow flex-col" data-pane-id={id} data-side={side}>
	<Component {...props} />
</div>
