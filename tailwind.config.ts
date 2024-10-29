import containerQueries from '@tailwindcss/container-queries';
import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			fontFamily: {
				sans: [
					'Quantico',
					'ui-sans-serif',
					'system-ui',
					'sans-serif',
					'"Apple Color Emoji"',
					'"Segoe UI Emoji"',
					'"Segoe UI Symbol"',
					'"Noto Color Emoji"'
				],
				display: ['Bergan']
			}
		}
	},

	plugins: [containerQueries]
} as Config;
