import type { Config } from '@toda/core';
import { Commands } from './Commands';
import { ConfigHypergraph } from './ConfigHypergraph';

export type Subscription = () => Promise<void> | void;

export class Context {
	readonly config: Config;
	readonly hypergraph: ConfigHypergraph;
	readonly subscriptions: Subscription[] = [];
	readonly commands = new Commands();

	constructor(config: Config) {
		this.config = config;
		this.hypergraph = new ConfigHypergraph(this.config);
	}
}