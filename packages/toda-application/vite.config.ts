import { paraglideVitePlugin } from '@inlang/paraglide-js'
import { defineConfig, loadEnv, type UserConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { readFileSync } from 'node:fs';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
	const isProd = mode === "production" || !process.env.TAURI_ENV_DEBUG;

	process.env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };

	const packageJSON = JSON.parse(readFileSync(`${__dirname}/package.json`).toString('utf8'));

	const host = process.env.TAURI_DEV_HOST;

	const define = {
		__VERSION__: JSON.stringify(packageJSON.version)
	};

	const config: UserConfig = {
		clearScreen: false,
		server: {
			host: host || '0.0.0.0',
			port: 5173,
			strictPort: true,
			hmr: host ? {
				protocol: 'ws',
				host,
				port: 5183,
			} : undefined,
			watch: {
				ignored: ['**/src-tauri/**']
			}
		},
		envPrefix: ['VITE_', 'TAURI_ENV_*'],
		plugins: [
			tailwindcss(),
			sveltekit(),
			paraglideVitePlugin({
				project: './project.inlang',
				outdir: './src/lib/paraglide',
				strategy: ['baseLocale', 'preferredLanguage'],
			}),
		],
		build: {
			target:
				(!process.env.TAURI_ENV_PLATFORM || process.env.TAURI_ENV_PLATFORM === 'windows')
					? 'chrome105'
					: 'safari13',
			minify: isProd ? 'esbuild' : false,
			sourcemap: !isProd,
		},
		define
	};

	return config;
});
