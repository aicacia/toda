import { loadEnv, searchForWorkspaceRoot } from 'vite';
import { defineConfig, mergeConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { networkInterfaces } from 'node:os';
import { readFile } from 'node:fs/promises';

export default defineConfig(async (configEnv) => {
	const isProd = configEnv.mode === 'production';

	process.env = { ...process.env, ...loadEnv(configEnv.mode, __dirname, '') };

	const packageJSON = JSON.parse((await readFile(`${__dirname}/package.json`)).toString('utf8'));

	const host = process.env.TAURI_DEV_HOST || getInternalIpV4();

	const define: Record<string, unknown> = {
		__VERSION__: JSON.stringify(packageJSON.version)
	};

	if (!isProd) {
		if (process.env.PUBLIC_TODO_URL) {
			define.__DEV_TODO_URL__ = JSON.stringify(setUrlHost(process.env.PUBLIC_TODO_URL, host));
		}
	}

	return mergeConfig(configEnv, {
		plugins: [sveltekit()],
		server: {
			host: '0.0.0.0',
			port: 5173,
			strictPort: true,
			hmr: {
				host,
				port: 5183
			},
			watch: {
				ignored: ['**/src-tauri/**']
			},
			fs: {
				allow: ['../..']
			}
		},
		define,

		test: {
			include: ['src/**/*.{test,spec}.{js,ts}']
		}
	});
});

function setUrlHost(urlValue: string, host: string) {
	const url = new URL(urlValue);
	url.host = host;
	let urlString = url.toString();
	if (urlString.endsWith('/')) {
		urlString = urlString.slice(0, -1);
	}
	return urlString;
}

function getInternalIpV4() {
	if (process.env.TAURI_DEV_HOST) {
		return process.env.TAURI_DEV_HOST;
	}
	const nets = networkInterfaces();
	for (const networks of Object.values(nets)) {
		if (networks) {
			for (const net of networks) {
				const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
				if (net.family === familyV4Value && !net.internal) {
					return net.address;
				}
			}
		}
	}
	return '0.0.0.0';
}
