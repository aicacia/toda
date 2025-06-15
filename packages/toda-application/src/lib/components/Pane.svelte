<script lang="ts" module>
	import type { Side } from '$lib/stores/layouts.svelte';
	import type { Component } from 'svelte';

	export interface BasePaneProps {
		id: string;
		x: number;
		y: number;
		width: number;
		height: number;
	}

	export interface PaneProps<Props extends BasePaneProps = BasePaneProps> extends BasePaneProps {
		id: string;
		Component: Component<Props, {}, keyof Props>;
		props: Props;
		side?: Side;
	}
</script>

<script lang="ts">
	type T = $$Generic<BasePaneProps>;

	let { Component, props, x, y, width, height, id, side }: PaneProps<T> = $props();
</script>

<div class="pane relative flex flex-grow flex-col" data-pane-id={id} data-side={side}>
	<Component {...props} {id} {x} {y} {width} {height} />
</div>
