<script lang="ts" module>
	import type { Side } from '$lib/stores/layouts.svelte';
	import type { Component } from 'svelte';

	export interface BasePaneProps {
		id: string;
		x: number;
		y: number;
		width: number;
		height: number;
		side?: Side;
	}

	export interface PaneProps<Props extends BasePaneProps = BasePaneProps> {
		// biome-ignore lint/complexity/noBannedTypes: empty exports
		Component: Component<Props, {}, ''>;
		props: Props;
	}
</script>

<script lang="ts">
	type T = $$Generic<BasePaneProps>;

	let { Component, props }: PaneProps<T> = $props();
</script>

<div class="pane relative flex flex-grow flex-col" data-pane-id={props.id} data-side={props.side}>
	<Component {...props} />
</div>
