<script lang="ts" module>
	import type { Extension } from '$lib/stores/extensions.svelte';
	import { onMount } from 'svelte';
	import type { BasePaneProps } from './Pane.svelte';
	import { Webview } from '@tauri-apps/api/webview';
	import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
	import { PhysicalPosition, PhysicalSize } from '@tauri-apps/api/dpi';

	export interface ExtensionProps extends BasePaneProps {
		extension: Extension;
	}
</script>

<script lang="ts">
	let { id, x, y, width, height, extension }: ExtensionProps = $props();

	let webview: Webview | undefined;

	onMount(() => {
		webview = new Webview(getCurrentWebviewWindow(), id, {
			url: extension.uri(`index.html`),
			x,
			y,
			width,
			height
		});
		webview.once('tauri://created', function () {
			console.log(webview);
		});
		webview.once('tauri://error', function (e) {
			console.error(e);
		});

		return () => {
			webview?.close();
		};
	});

	$effect(() => {
		if (webview) {
			webview.setPosition(new PhysicalPosition(x, y));
		}
	});
	$effect(() => {
		if (webview) {
			webview.setSize(new PhysicalSize(width, height));
		}
	});
</script>

<div
	title="{extension.config.packageJSON.name}@{extension.config.packageJSON.version}: {extension
		.config.packageJSON.description}"
	class="h-full w-full overflow-hidden"
></div>
