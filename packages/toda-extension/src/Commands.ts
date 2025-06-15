export type Command = () => Promise<void> | void;

export class Commands {
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

	has(name: string) {
		return this.#commands.has(name);
	}

	async call(name: string) {
		const command = this.#commands.get(name);
		if (command) {
			return await command();
		}
		throw new Error(`Command not found: ${name}`);
	}
}
