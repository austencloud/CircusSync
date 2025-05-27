// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class', // Enable class-based dark mode
	theme: {
		extend: {
			colors: {
				gray: {
					750: '#374151', // Custom gray for better dark mode
				}
			}
		}
	},
	plugins: [
		require('@tailwindcss/forms') // If you use form styling resets
	]
};
