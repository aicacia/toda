<script lang="ts" module>
	import type { Extension } from '$lib/stores/extensions.svelte';
	import { onMount } from 'svelte';
	import type { BasePaneProps } from './Pane.svelte';
	import { Webview } from '@tauri-apps/api/webview';
	import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
	import { LogicalPosition, LogicalSize } from '@tauri-apps/api/dpi';

	export interface ExtensionProps extends BasePaneProps {
		extension: Extension;
	}
</script>

<script lang="ts">
	let { id, x, y, width, height, extension }: ExtensionProps = $props();

	let webview: Webview | undefined;

	onMount(() => {
		const webviewWindow = getCurrentWebviewWindow();
		webview = new Webview(webviewWindow, id, {
			url: extension.uri(`index.html`),
			x,
			y,
			width,
			height
		});
		webview.listen('tauri://created', function () {
			console.log(webview);
		});
		webview.listen('tauri://error', function (e) {
			console.error(e);
		});
		function onClose() {
			window.removeEventListener('beforeunload', onClose);
			webview?.close();
		}
		window.addEventListener('beforeunload', onClose);
		return onClose;
	});

	$effect(() => {
		if (webview) {
			webview.setPosition(new LogicalPosition(x, y)).catch((err) => {
				console.error(err);
			});
		}
	});
	$effect(() => {
		if (webview) {
			webview.setSize(new LogicalSize(width, height)).catch((err) => {
				console.error(err);
			});
		}
	});
</script>

<div
	title="{extension.config.packageJSON.name}@{extension.config.packageJSON.version}: {extension
		.config.packageJSON.description}"
	class="h-full w-full overflow-hidden"
></div>
