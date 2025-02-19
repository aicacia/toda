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
				width: pane.width,
				height: pane.height,
				first: buildLayout(layout, pane.first),
				second: buildLayout(layout, pane.second)
			}
		};
	}
</script>

<script lang="ts">
	import {
		getOrCreateCurrentLayout,
		splitCurrentLayout,
		updateExtension,
		type Layout
	} from '$lib/stores/layouts.svelte';
	import EmptyPane from './EmptyPane.svelte';
	import Extension from './Extension.svelte';
	import SplitPane from './SplitPane.svelte';
	import { extensions } from '$lib/stores/extensions.svelte';
	import Popup from './Popup.svelte';
	import type { PaneProps } from './Pane.svelte';
	import Pane from './Pane.svelte';

	let currentLayout = $state(getOrCreateCurrentLayout());
	let layout = $derived(buildLayout(currentLayout));

	$effect(() => {
		currentLayout = getOrCreateCurrentLayout();
	});

	let element: HTMLElement;
	let contextMenuOpen = $state(false);
	let contextMenuAnchor: HTMLElement | undefined = $state();
	let x = $state(0);
	let y = $state(0);
	let splitX = $state(0);
	let splitY = $state(0);
	let id = $state<string | undefined>();

	function onContextMenu(e: MouseEvent) {
		e.preventDefault();

		const boundingRect = element.getBoundingClientRect();
		x = e.clientX - boundingRect.left;
		y = e.clientY - boundingRect.top;

		const pane = (e.target as HTMLElement).closest('.pane') as HTMLElement;
		const paneBundingRect = pane.getBoundingClientRect();
		splitX = x - paneBundingRect.left;
		splitY = y - paneBundingRect.top;
		id = pane.dataset['pane-id'];

		contextMenuOpen = true;
	}

	function onSplitVertically() {
		if (id !== undefined) {
			currentLayout = splitCurrentLayout(id, x, y, 'vertical');
			contextMenuOpen = false;
		}
	}
	function onSplitHorizontally() {
		if (id !== undefined) {
			currentLayout = splitCurrentLayout(id, x, y, 'horizontal');
			contextMenuOpen = false;
		}
	}
</script>

<div
	bind:this={element}
	class="relative flex flex-grow flex-col overflow-hidden"
	oncontextmenu={onContextMenu}
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
	<div class="px-2 py-1">
		<button
			onclick={onSplitVertically}
			class="flex cursor-pointer flex-row justify-between p-2 hover:bg-gray-200 dark:hover:bg-gray-600"
		>
			{m.pane_contextmanu_split_vertically()}
		</button>
		<button
			onclick={onSplitHorizontally}
			class="flex cursor-pointer flex-row justify-between p-2 hover:bg-gray-200 dark:hover:bg-gray-600"
		>
			{m.pane_contextmanu_split_horizontally()}
		</button>
	</div>
</Popup>
