import type { WebviewOptions } from '@tauri-apps/api/webview';
import { ExtensionCommands } from './ExtensionCommands';
import { ExtensionHypergraph } from './ExtensionHypergraph';

export interface ExtensionConfig {
	readonly id: string;
	readonly name: string;
	readonly version: string;
}

export type Subscription = () => Promise<void> | void;
export type MountWebviewOptions = Omit<WebviewOptions, 'x' | 'y' | 'width' | 'height'>;
export type MountFunction = (element: HTMLElement) => Promise<() => void> | (() => void);

export class ExtensionContext {
	readonly config: ExtensionConfig;
	readonly subscriptions: Subscription[] = [];
	readonly commands = new ExtensionCommands();
	readonly hypergraph = new ExtensionHypergraph(this);
	#mount?: MountFunction;

	constructor(config: ExtensionConfig) {
		this.config = config;
	}

	onMount(mount: MountFunction) {
		this.#mount = mount;
	}

	get id() {
		return this.config.id;
	}

	get mount() {
		return this.#mount;
	}
}

export type ExtensionFunction = (context: ExtensionContext) => Promise<void> | void;
