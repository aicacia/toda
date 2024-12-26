import { base } from '$app/paths';
import { json } from '@sveltejs/kit';

export const prerender = true;

export async function GET() {
	return json({
		name: 'Toda',
		short_name: 'Toda',
		description: 'Toda: The Everything Application',
		version: '1.0',
		manifest_version: 3,
		icons: [
			{
				src: `${base}/icon256x256.png`,
				sizes: '256x256',
				type: 'image/png'
			}
		],
		id: `${base}/?source=pwa`,
		start_url: `${base}/?source=pwa`,
		scope: `${base}/`,
		display: 'standalone',
		background_color: 'white',
		theme_color: '#A1C122'
	});
}
