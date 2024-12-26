// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	import * as TauriAPI from '@tauri-apps/api';

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	declare const __DEV_TODO_URL__: string | undefined;
	declare const __TAURI_INTERNALS__: TauriAPI;
	declare const __VERSION__: string;
}

export {};
