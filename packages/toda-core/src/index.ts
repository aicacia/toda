import EventEmitter from 'eventemitter3';
import type { WebviewOptions } from '@tauri-apps/api/webview';

export interface ExtensionConfig {
	readonly id: string;
	readonly name: string;
	readonly version: string;
}

export type PanelEvents = {
	resize(this: Panel, x: number, y: number, width: number, height: number): void;
};

export class Panel extends EventEmitter<PanelEvents> {
	constructor() {
		super();
	}
}

export type Command = () => Promise<void> | void;

export class ExtensionCommands {
	readonly #commands = new Map<string, Command>();

	register(name: string, command: Command) {
		this.#commands.set(name, command);
		return () => {
			this.#commands.delete(name);
		};
	}

	get(name: string) {
		return this.#commands.get(name);
	}
}

export type Subscription = () => Promise<void> | void;
export type MountWebviewOptions = Omit<WebviewOptions, 'x' | 'y' | 'width' | 'height'>;
export type MountFunction = (element: HTMLElement) => Promise<() => void> | (() => void);

export class ExtensionContext {
	readonly config: ExtensionConfig;
	readonly subscriptions: Subscription[] = [];
	readonly commands = new ExtensionCommands();
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
