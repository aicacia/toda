<script lang="ts" module>
	import * as m from '$lib/paraglide/messages';

	function buildLayout(
		layout: Layout,
		id: string = layout.id,
		x = 0,
		y = 0,
		width = 0,
		height = 0
		// biome-ignore lint/suspicious/noExplicitAny: any
	): PaneProps<any> {
		const pane = layout.panes[id];
		if (pane.type === 'extension-pane') {
			if (pane.extension) {
				const extension = extensions[pane.extension];
				if (extension) {
					return {
						id,
						Component: Extension,
						x,
						y,
						width,
						height,
						props: { extension } as ExtensionProps
					};
				}
			}
			return {
				id,
				Component: EmptyPane,
				x,
				y,
				width,
				height,
				props: {
					onSetExtension(extension?: string) {
						updateExtension(id, extension);
					}
				} as EmptyPaneProps
			};
		}
		return {
			id,
			Component: SplitPane,
			x,
			y,
			width,
			height,
			props: {
				direction: pane.direction,
				splitAt: pane.splitAt,
				onsplitatchange(splitAt: number) {
					updateSplitAt(id, splitAt);
				},
				onsizechange(width: number, height: number) {
					updateSize(id, width, height);
				},
				first: buildLayout(layout, pane.first),
				second: buildLayout(layout, pane.second)
			} as SplitPaneProps
		};
	}
</script>

<script lang="ts">
	import {
		joinCurrentLayout,
		layouts,
		splitCurrentLayout,
		updateExtension,
		updateSplitAt,
		updateSize,
		type Layout,
		type Side
	} from '$lib/stores/layouts.svelte';
	import EmptyPane, { type EmptyPaneProps } from './EmptyPane.svelte';
	import Extension, { type ExtensionProps } from './Extension.svelte';
	import SplitPane, { type SplitPaneProps } from './SplitPane.svelte';
	import { extensions } from '$lib/stores/extensions.svelte';
	import Popup from './Popup.svelte';
	import type { PaneProps } from './Pane.svelte';
	import Pane from './Pane.svelte';

	let element = $state<HTMLElement>();
	let offsetWidth = $state(0);
	let offsetHeight = $state(0);
	let layout = $derived(
		buildLayout(
			layouts.current,
			layouts.current.id,
			element?.offsetLeft ?? 0,
			element?.offsetTop ?? 0,
			offsetWidth,
			offsetHeight
		)
	);

	let contextMenuOpen = $state(false);
	let contextMenuDivider = $state(false);
	let contextMenuAnchor: HTMLElement | undefined = $state();
	let mouseX = $state(0);
	let mouseY = $state(0);
	let splitX = $state(0);
	let splitY = $state(0);
	let splitW = $state(0);
	let splitH = $state(0);
	let join = $state<Side>();
	let id = $state<string | undefined>();

	function onContextMenu(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();

		mouseX = e.clientX - (element?.offsetLeft ?? 0);
		mouseY = e.clientY - (element?.offsetTop ?? 0);

		const target = e.target as HTMLElement;
		contextMenuDivider = target.classList.contains('divider');
		if (contextMenuDivider) {
			const pane = target.closest('.pane')!.closest('.pane') as HTMLElement;
			id = pane.dataset['pane-id'];
		} else {
			const pane = target.closest('.pane') as HTMLElement;
			const paneBundingRect = pane.getBoundingClientRect();
			splitX = mouseX - paneBundingRect.left;
			splitY = mouseY - paneBundingRect.top;
			splitW = paneBundingRect.width;
			splitH = paneBundingRect.height;
			id = pane.dataset['pane-id'];
		}
		contextMenuOpen = true;
	}
	function onPointerUp() {
		if (id && join) {
			joinCurrentLayout(id, join);
			join = undefined;
		}
	}
	function onPointerMove(e: PointerEvent) {
		if (id) {
			const target = e.target as HTMLElement;
			const pane = target.closest(`[data-pane-id="${id}"] .pane`) as HTMLElement;
			if (pane) {
				join = pane.dataset['side'] as Side;
				const container = pane.closest('.pane-container') as HTMLElement;
				container.dataset['side'] = join;
			}
		}
	}

	function onJoin() {
		if (id) {
			join = 'second';
			contextMenuOpen = false;
		}
	}
	function onSplitVertically() {
		if (id) {
			splitCurrentLayout(id, splitX, splitY, splitW, splitH, 'vertical');
			id = undefined;
			contextMenuOpen = false;
		}
	}
	function onSplitHorizontally() {
		if (id) {
			splitCurrentLayout(id, splitX, splitY, splitW, splitH, 'horizontal');
			id = undefined;
			contextMenuOpen = false;
		}
	}
</script>

<div
	bind:this={element}
	bind:offsetWidth
	bind:offsetHeight
	class="relative flex flex-grow flex-col overflow-hidden"
	oncontextmenu={onContextMenu}
	onpointerupcapture={onPointerUp}
	onpointermovecapture={onPointerMove}
	role="grid"
	tabindex="0"
>
	<Pane
		id={layout.id}
		Component={layout.Component}
		props={layout.props}
		x={layout.x}
		y={layout.y}
		width={layout.width}
		height={layout.height}
	/>
	<div bind:this={contextMenuAnchor} class="absolute" style="left:{mouseX}px;top:{mouseY}px;"></div>
</div>

<Popup
	anchor={contextMenuAnchor}
	anchorPosition="top-left"
	position="top-left"
	bind:open={contextMenuOpen}
>
	<div>
		{#if contextMenuDivider}
			<button
				onclick={onJoin}
				class="flex w-full flex-grow cursor-pointer flex-row justify-between p-2 hover:bg-gray-200 dark:hover:bg-gray-600"
			>
				{m.pane_contextmanu_join()}
			</button>
		{:else}
			<button
				onclick={onSplitVertically}
				class="flex w-full flex-grow cursor-pointer flex-row justify-between p-2 hover:bg-gray-200 dark:hover:bg-gray-600"
			>
				{m.pane_contextmanu_split_vertically()}
			</button>
			<button
				onclick={onSplitHorizontally}
				class="flex w-full flex-grow cursor-pointer flex-row justify-between p-2 hover:bg-gray-200 dark:hover:bg-gray-600"
			>
				{m.pane_contextmanu_split_horizontally()}
			</button>
		{/if}
	</div>
</Popup>
