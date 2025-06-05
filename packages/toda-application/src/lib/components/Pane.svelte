<script lang="ts" module>
	import type { Component } from 'svelte';

	export interface PaneProps<Props extends Record<string, any> = Record<string, any>> {
		id: string;
		Component: Component<Props, {}, keyof Props>;
		props: Props;
	}
</script>

<script lang="ts">
	type T = $$Generic<Record<string, any>>;

	let { Component, props, id }: PaneProps<T> = $props();
</script>

<div class="pane relative flex flex-grow flex-col" data-pane-id={id}>
	<Component {...props} />
</div>
