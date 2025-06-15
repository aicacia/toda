import { homeDir, join } from '@tauri-apps/api/path';
import { Hypergraph, type Config } from '@toda/core';

export class ConfigHypergraph extends Hypergraph {
	readonly #config: Config;

	constructor(config: Config) {
		super();
		this.#config = config;
	}

	prefixUriFn = (uri: string) => `${this.#config.packageJSON.name}/${uri}`;

	async filename() {
		// TODO: allow database to be switched out
		return join(await homeDir(), '.toda', 'databases', 'toda.db');
	}
}
