<script lang="ts" module>
	import type { PaneProps } from './Pane.svelte';
	import Pane from './Pane.svelte';
	import { noop } from '$lib/util';

	export type SplitPaneDirection = 'vertical' | 'horizontal';

	export interface SplitPaneProps {
		id: string;
		direction?: SplitPaneDirection;
		value?: number;
		width?: number;
		height?: number;
		first: PaneProps;
		second: PaneProps;
		onchange?(value: number): void;
	}
</script>

<script lang="ts">
	let {
		direction = $bindable('vertical'),
		value = $bindable(0),
		width = $bindable(0),
		height = $bindable(0),
		first,
		second,
		onchange = noop
	}: SplitPaneProps = $props();

	let vertical = $state(direction === 'vertical');
	let horizontal = $state(direction === 'horizontal');
	$effect(() => {
		vertical = direction === 'vertical';
		horizontal = direction === 'horizontal';
	});
	let size = $derived(direction === 'vertical' ? width : height);
	let firstSize = $state(0);
	let secondSize = $state(0);

	$effect(() => {
		if (size === 0) {
			return;
		}
		value = Math.max(0, Math.min(value, size));
		firstSize = value;
		secondSize = size - firstSize;
		onchange(value);
	});

	let element: HTMLElement;
	let mousedown = $state(false);
	function onMouseDown(e: MouseEvent) {
		if (e.button === 0) {
			e.preventDefault();
			mousedown = true;
		}
	}
	function onMouseMove(e: MouseEvent) {
		if (mousedown) {
			const boundingRect = element.getBoundingClientRect();
			value = vertical ? e.clientX - boundingRect.left : e.clientY - boundingRect.top;
		}
	}
	function onMouseUp(_e: MouseEvent) {
		if (mousedown) {
			mousedown = false;
		}
	}
</script>

<div
	bind:this={element}
	class="relative flex h-full w-full"
	class:flex-row={vertical}
	class:flex-col={horizontal}
	class:cursor-col-resize={vertical && mousedown}
	class:cursor-row-resize={horizontal && mousedown}
	bind:clientWidth={width}
	bind:clientHeight={height}
	onmousemove={onMouseMove}
	onmouseup={onMouseUp}
	onmouseleave={onMouseUp}
	role="grid"
	tabindex="0"
>
	<div class="flex grow flex-col" class:w-full={horizontal} class:h-full={vertical}>
		<div
			class="flex grow flex-col overflow-auto"
			style="width:{vertical ? `${firstSize}px` : 'inherit'};height:{horizontal
				? `${firstSize}px`
				: 'inherit'};"
		>
			<Pane {...first} />
		</div>
	</div>
	<div class="flex grow flex-col" class:w-full={horizontal} class:h-full={vertical}>
		<div
			class="flex grow flex-col overflow-auto"
			style="width:{vertical ? `${secondSize}px` : 'inherit'};height:{horizontal
				? `${secondSize}px`
				: 'inherit'};"
		>
			<Pane {...second} />
		</div>
	</div>
	<div
		class="absolute z-10"
		class:px-[6px]={vertical}
		class:py-[6px]={horizontal}
		class:w-full={horizontal}
		class:h-full={vertical}
		class:min-w-[1px]={vertical}
		class:min-h-[1px]={horizontal}
		class:cursor-col-resize={vertical}
		class:cursor-row-resize={horizontal}
		style="left:{vertical ? `${firstSize - 6}px` : 'inherit'};top:{horizontal
			? `${firstSize - 6}px`
			: 'inherit'}"
		onmousedown={onMouseDown}
		role="gridcell"
		tabindex="0"
	>
		<div
			class="bg-gray-200 dark:bg-gray-700"
			class:w-full={horizontal}
			class:h-full={vertical}
			class:min-w-[1px]={vertical}
			class:min-h-[1px]={horizontal}
		></div>
	</div>
</div>
