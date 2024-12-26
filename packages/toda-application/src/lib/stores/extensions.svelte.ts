import { browser, building } from '$app/environment';
import { type ExtensionFunction, ExtensionContext, type ExtensionConfig } from '@toda/core';
import defaultExtension from '@toda/default-extension';

export const extensions = $state<{ [id: string]: ExtensionContext }>({});

export async function registerExtension(config: ExtensionConfig, extension: ExtensionFunction) {
	const context = new ExtensionContext(config);
	await extension(context);
	extensions[config.id] = context;
}

if (browser && !building) {
	registerExtension(
		{
			id: 'com.toda.default',
			name: 'Default',
			version: '0.0.1'
		},
		defaultExtension
	);
}
