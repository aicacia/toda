import { browser, building } from '$app/environment';
import { extensionsPath, type Config, WorkerEventEmitter } from '@toda/core';
import type { ExtensionWorkerEventEmitterEventTypes } from '@toda/extension';
import { exists, readDir, readTextFile } from '@tauri-apps/plugin-fs';
import { join, sep } from '@tauri-apps/api/path';

export class Extension {
	readonly config: Config;
	readonly worker: Worker;
	readonly emitter: WorkerEventEmitter<ExtensionWorkerEventEmitterEventTypes>;

	constructor(config: Config, worker: Worker) {
		this.config = config;
		this.worker = worker;
		this.emitter = new WorkerEventEmitter(worker);
	}

	uri(path: string) {
		return `toda://${this.config.packageJSON.name.replaceAll('@', '').replaceAll('/', '.')}/${path}`
	}

	call(name: string) {
		this.emitter.emit('command', name);
	}

	listen() {
		this.emitter.once('ready', () => this.emitter.emit('config', this.config));
		this.emitter.on('extensionerror', this.#onExtensionError);
		this.emitter.on('workererror', this.#onWorkerError);
		this.emitter.on('messageerror', this.#onMessageError);
	}

	unlisten() {
		this.emitter.off('extensionerror', this.#onExtensionError);
		this.emitter.off('workererror', this.#onWorkerError);
		this.emitter.off('messageerror', this.#onMessageError);
	}

	#onExtensionError = (error: unknown) => {
		console.error('extensionerror', error);
	};

	#onWorkerError = (error: unknown) => {
		console.error('workererror', error);
	};

	#onMessageError = (error: unknown) => {
		console.error('messageerror', error);
	};

	static async createWorker(config: Config) {
		const scriptContent = await readTextFile(`${config.url}${sep()}${config.packageJSON.main}`);
		const blob = new Blob([scriptContent], { type: 'application/javascript' });
		const workerUrl = URL.createObjectURL(blob);
		return new Worker(workerUrl, { type: 'module' });
	}
}

export const extensions = $state<{ [name: string]: Extension }>({});

export async function registerExtension(config: Config) {
	const worker = await Extension.createWorker(config);
	const extension = new Extension(config, worker);
	extensions[config.packageJSON.name] = extension;
	extension.listen();
}

if (browser && !building) {
	extensionsPath().then(extensionConfigs).then(async (extensions) =>
		await Promise.all(extensions.map(registerExtension))
	);
}

async function extensionConfigs(path: string) {
	const extensions: Config[] = [];
	await Promise.all((await readDir(path)).map(async entry => {
		const entryPath = await join(path, entry.name);
		if (entry.isDirectory || entry.isSymlink) {
			const packageJSONPath = await join(entryPath, 'package.json');
			if (await exists(packageJSONPath)) {
				const packageJSON = JSON.parse(await readTextFile(packageJSONPath));
				extensions.push({
					url: `file://${entryPath}`,
					packageJSON
				});
			} else {
				extensions.push(...await extensionConfigs(entryPath));
			}
		}
	}));
	return extensions;
}