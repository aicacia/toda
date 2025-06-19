<script lang="ts" module>
	import type { PaneProps, BasePaneProps } from './Pane.svelte';
	import Pane from './Pane.svelte';
	import { noop } from '$lib/util';

	export interface SplitPaneProps extends BasePaneProps {
		direction: Direction;
		splitAt: number;
		first: PaneProps;
		second: PaneProps;
		onsplitatchange?(splitAt: number): void;
		onsizechange?(width: number, height: number): void;
	}
</script>

<script lang="ts">
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';
	import ArrowUp from 'lucide-svelte/icons/arrow-up';
	import ArrowDown from 'lucide-svelte/icons/arrow-down';
	import type { Direction } from '$lib/stores/layouts.svelte';

	let {
		direction = $bindable('vertical'),
		splitAt = $bindable(0),
		x,
		y,
		width,
		height,
		first,
		second,
		onsplitatchange = noop,
		onsizechange = noop
	}: SplitPaneProps = $props();

	let lastWidth = width;
	let lastHeight = height;
	$effect(() => {
		if (lastWidth !== width || lastHeight !== height) {
			lastWidth = width;
			lastHeight = height;
			onsizechange(width, height);
		}
	});

	let vertical = $state(direction === 'vertical');
	let horizontal = $state(direction === 'horizontal');
	$effect(() => {
		vertical = direction === 'vertical';
		horizontal = direction === 'horizontal';
	});
	const size = $derived(direction === 'vertical' ? width : height);
	let firstSize = $state(0);
	let secondSize = $state(0);

	$effect(() => {
		if (size === 0) {
			return;
		}
		splitAt = Math.max(0, Math.min(splitAt, size));
		firstSize = splitAt;
		secondSize = size - firstSize;
		onsplitatchange(splitAt);
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
			splitAt = vertical ? e.clientX - boundingRect.left : e.clientY - boundingRect.top;
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
	class="pane-container relative flex h-full w-full"
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
	<div class="pane-first flex grow flex-col" class:w-full={horizontal} class:h-full={vertical}>
		<div
			class="relative flex grow flex-col overflow-auto"
			style="width:{vertical ? `${firstSize}px` : 'inherit'};height:{horizontal
				? `${firstSize}px`
				: 'inherit'};"
		>
			<Pane
				Component={first.Component}
				props={{
					...first.props,
					x,
					y,
					width: vertical ? firstSize : width,
					height: horizontal ? firstSize : height,
					side: 'first'
				}}
			/>
			<div
				class="join-direction absolute left-0 top-0 hidden h-full w-full items-center justify-center bg-black/25 opacity-25"
			>
				<div class="h-[50vh] w-auto">
					{#if vertical}
						<ArrowLeft size="100%" />
					{:else}
						<ArrowUp size="100%" />
					{/if}
				</div>
			</div>
		</div>
	</div>
	<div class="pane-second flex grow flex-col" class:w-full={horizontal} class:h-full={vertical}>
		<div
			class="relative flex grow flex-col overflow-auto"
			style="width:{vertical ? `${secondSize}px` : 'inherit'};height:{horizontal
				? `${secondSize}px`
				: 'inherit'};"
		>
			<Pane
				Component={second.Component}
				props={{
					...second.props,
					x: vertical ? x + firstSize : x,
					y: horizontal ? y + firstSize : y,
					width: vertical ? secondSize : width,
					height: horizontal ? secondSize : height,
					side: 'second'
				}}
			/>
			<div
				class="join-direction absolute left-0 top-0 hidden h-full w-full items-center justify-center bg-black/25 opacity-25"
			>
				<div class="h-[50vh] w-auto">
					{#if vertical}
						<ArrowRight size="100%" />
					{:else}
						<ArrowDown size="100%" />
					{/if}
				</div>
			</div>
		</div>
	</div>
	<div
		class="divider absolute z-10"
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

<style lang="postcss">
	@reference "tailwindcss";

	:global {
		.pane-container[data-side='first'] .pane-first .join-direction,
		.pane-container[data-side='second'] .pane-second .join-direction {
			@apply flex;
		}
	}
</style>
