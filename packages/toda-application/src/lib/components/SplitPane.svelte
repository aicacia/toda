<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export type SplitPaneDirection = 'vertical' | 'horizontal';

	export interface SplitPaneProps {
		direction?: SplitPaneDirection;
		value?: number;
		width?: number;
		height?: number;
		first: Snippet;
		second: Snippet;
	}
</script>

<script lang="ts">
	let {
		direction = $bindable('vertical'),
		value = $bindable(0.5),
		width = $bindable(0),
		height = $bindable(0),
		first,
		second
	}: SplitPaneProps = $props();

	let vertical = $state(direction === 'vertical');
	let horizontal = $state(direction === 'horizontal');
	$effect(() => {
		vertical = direction === 'vertical';
		horizontal = direction === 'horizontal';
	});

	let size = $derived(direction === 'vertical' ? width : height);

	let firstWidth = $state(0);
	let firstHeight = $state(0);
	let secondWidth = $state(0);
	let secondHeight = $state(0);

	let prevValue = $state(0);
	let prevSize = $state(0);
	$effect(() => {
		value = Math.max(0, Math.min(value, 1.0));
		prevValue = value;
		prevSize = size;
		if (vertical) {
			firstWidth = size * value;
			firstHeight = 0;
			secondWidth = size - firstWidth;
			secondHeight = 0;
		} else {
			firstWidth = 0;
			firstHeight = size * value;
			secondWidth = 0;
			secondHeight = size - firstHeight;
		}
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
			value = (vertical ? e.clientX - boundingRect.left : e.clientY - boundingRect.top) / size;
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
			style="width:{firstWidth > 0 ? `${firstWidth}px` : 'inherit'};height:{firstHeight > 0
				? `${firstHeight}px`
				: 'inherit'};"
		>
			{@render first()}
		</div>
	</div>
	<div class="flex grow flex-col" class:w-full={horizontal} class:h-full={vertical}>
		<div
			class="flex grow flex-col overflow-auto"
			style="width:{secondWidth > 0 ? `${secondWidth}px` : 'inherit'};height:{secondHeight > 0
				? `${secondHeight}px`
				: 'inherit'};"
		>
			{@render second()}
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
		style="left:{firstWidth > 0 ? `${firstWidth - 6}px` : 'inherit'};top:{firstHeight > 0
			? `${firstHeight - 6}px`
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
