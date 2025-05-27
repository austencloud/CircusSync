// src/lib/stores/themeStore.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

// Create the theme store with initial value
function createThemeStore() {
	// Get initial theme from localStorage or default to 'light'
	const getInitialTheme = (): Theme => {
		if (!browser) return 'light';
		
		try {
			const stored = localStorage.getItem('circussync-theme');
			if (stored === 'dark' || stored === 'light') {
				return stored;
			}
			
			// Check system preference if no stored preference
			if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
				return 'dark';
			}
		} catch (error) {
			console.warn('Failed to read theme from localStorage:', error);
		}
		
		return 'light';
	};

	const { subscribe, set, update } = writable<Theme>(getInitialTheme());

	return {
		subscribe,
		set: (theme: Theme) => {
			if (browser) {
				try {
					localStorage.setItem('circussync-theme', theme);
					// Apply theme to document
					document.documentElement.classList.remove('light', 'dark');
					document.documentElement.classList.add(theme);
					document.documentElement.setAttribute('data-theme', theme);
				} catch (error) {
					console.warn('Failed to save theme to localStorage:', error);
				}
			}
			set(theme);
		},
		toggle: () => {
			update(current => {
				const newTheme = current === 'light' ? 'dark' : 'light';
				if (browser) {
					try {
						localStorage.setItem('circussync-theme', newTheme);
						// Apply theme to document
						document.documentElement.classList.remove('light', 'dark');
						document.documentElement.classList.add(newTheme);
						document.documentElement.setAttribute('data-theme', newTheme);
					} catch (error) {
						console.warn('Failed to save theme to localStorage:', error);
					}
				}
				return newTheme;
			});
		},
		// Initialize theme on app start
		init: () => {
			if (browser) {
				const theme = getInitialTheme();
				document.documentElement.classList.remove('light', 'dark');
				document.documentElement.classList.add(theme);
				document.documentElement.setAttribute('data-theme', theme);
				set(theme);
			}
		}
	};
}

export const themeStore = createThemeStore();
