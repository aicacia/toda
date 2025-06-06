<script lang="ts" module>
	import * as m from '$lib/paraglide/messages';

	function buildLayout(layout: Layout, id: string = layout.id): PaneProps<any> {
		const pane = layout.panes[id];
		if (pane.type === 'extension-pane') {
			if (pane.extension) {
				const context = extensions[pane.extension];
				if (context) {
					return { id, Component: Extension, props: { context } };
				}
			}
			return {
				id,
				Component: EmptyPane,
				props: {
					onSetExtension(extension: string) {
						return updateExtension(id, extension);
					}
				}
			};
		}
		return {
			id,
			Component: SplitPane,
			props: {
				direction: pane.direction,
				value: pane.value,
				onchange(value: number) {
					updateValue(id, value);
				},
				first: buildLayout(layout, pane.first),
				second: buildLayout(layout, pane.second)
			}
		};
	}
</script>

<script lang="ts">
	import {
		getOrCreateCurrentLayout,
		joinCurrentLayout,
		splitCurrentLayout,
		updateExtension,
		updateValue,
		type Layout,
		type Side
	} from '$lib/stores/layouts.svelte';
	import EmptyPane from './EmptyPane.svelte';
	import Extension from './Extension.svelte';
	import SplitPane from './SplitPane.svelte';
	import { extensions } from '$lib/stores/extensions.svelte';
	import Popup from './Popup.svelte';
	import type { PaneProps } from './Pane.svelte';
	import Pane from './Pane.svelte';
	import type { Pointer } from 'lucide-svelte';

	let currentLayout = $state(getOrCreateCurrentLayout());
	let layout = $derived(buildLayout(currentLayout));

	let element: HTMLElement;
	let contextMenuOpen = $state(false);
	let contextMenuDivider = $state(false);
	let contextMenuAnchor: HTMLElement | undefined = $state();
	let x = $state(0);
	let y = $state(0);
	let splitX = $state(0);
	let splitY = $state(0);
	let splitW = $state(0);
	let splitH = $state(0);
	let join = $state<Side>();
	let id = $state<string | undefined>();

	function onContextMenu(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();

		const boundingRect = element.getBoundingClientRect();
		x = e.clientX - boundingRect.left;
		y = e.clientY - boundingRect.top;

		const target = e.target as HTMLElement;
		contextMenuDivider = target.classList.contains('divider');
		if (contextMenuDivider) {
			const pane = target.closest('.pane')!.closest('.pane') as HTMLElement;
			id = pane.dataset['pane-id'];
		} else {
			const pane = target.closest('.pane') as HTMLElement;
			const paneBundingRect = pane.getBoundingClientRect();
			splitX = x - paneBundingRect.left;
			splitY = y - paneBundingRect.top;
			splitW = paneBundingRect.width;
			splitH = paneBundingRect.height;
			id = pane.dataset['pane-id'];
		}
		contextMenuOpen = true;
	}
	function onPointerUp() {
		if (id && join) {
			currentLayout = joinCurrentLayout(id, join);
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
			currentLayout = splitCurrentLayout(id, splitX, splitY, splitW, splitH, 'vertical');
			id = undefined;
			contextMenuOpen = false;
		}
	}
	function onSplitHorizontally() {
		if (id !== undefined) {
			currentLayout = splitCurrentLayout(id, splitX, splitY, splitW, splitH, 'horizontal');
			id = undefined;
			contextMenuOpen = false;
		}
	}
</script>

<div
	bind:this={element}
	class="relative flex flex-grow flex-col overflow-hidden"
	oncontextmenu={onContextMenu}
	onpointerupcapture={onPointerUp}
	onpointermovecapture={onPointerMove}
	role="grid"
	tabindex="0"
>
	<Pane id={layout.id} Component={layout.Component} props={layout.props} />
	<div bind:this={contextMenuAnchor} class="absolute" style="left:{x}px;top:{y}px;"></div>
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
