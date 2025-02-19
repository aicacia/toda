import { browser, building } from '$app/environment';
import { type ExtensionFunction, ExtensionContext, type ExtensionConfig } from '@toda/core';
import defaultExtension from '@toda/default-extension';

export const extensions = $state<{ [name: string]: ExtensionContext }>({});

export async function registerExtension(config: ExtensionConfig, extension: ExtensionFunction) {
	const context = new ExtensionContext(config);
	await extension(context);
	extensions[config.name] = context;
}

if (browser && !building) {
	registerExtension(
		{
			name: "@toda/default-extension",
			version: "0.1.0",
			description: "Toda Default Extension",
		},
		defaultExtension
	);
}
