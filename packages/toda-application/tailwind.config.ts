import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',

	plugins: [],

	theme: {
		fontSize: {
			xs: '0.75rem',
			sm: '0.85rem',
			base: '1rem',
			lg: '1.25rem',
			xl: '1.5rem',
			'2xl': '1.75rem',
			'3xl': '2rem',
			'4xl': '2.5rem',
			'5xl': '3rem'
		},
		screens: {
			xs: '320px',
			sm: '480px',
			md: '768px',
			lg: '1024px',
			xl: '1280px'
		},
		extend: {
			colors: {
				// https://uicolors.app/create
			}
		}
	}
} satisfies Config;
