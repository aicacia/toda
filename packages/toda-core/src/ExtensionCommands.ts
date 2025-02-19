export type ExtensionCommand = () => Promise<void> | void;

export class ExtensionCommands {
	readonly #commands = new Map<string, ExtensionCommand>();

	register(name: string, command: ExtensionCommand) {
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
}
