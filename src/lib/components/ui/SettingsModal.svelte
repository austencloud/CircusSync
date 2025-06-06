<!-- src/lib/components/ui/SettingsModal.svelte -->
<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { themeStore } from '$lib/stores/themeStore';
	import Icon from './Icon.svelte';

	export let isOpen = false;

	const dispatch = createEventDispatcher<{ close: void }>();

	// Handle escape key and outside clicks
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			close();
		}
	}

	function close() {
		isOpen = false;
		dispatch('close');
	}

	// Focus management for accessibility
	let modalElement: HTMLDivElement;
	let firstFocusableElement: HTMLElement;
	let lastFocusableElement: HTMLElement;

	function trapFocus(event: KeyboardEvent) {
		if (event.key !== 'Tab') return;

		if (event.shiftKey) {
			if (document.activeElement === firstFocusableElement) {
				event.preventDefault();
				lastFocusableElement?.focus();
			}
		} else {
			if (document.activeElement === lastFocusableElement) {
				event.preventDefault();
				firstFocusableElement?.focus();
			}
		}
	}

	$: if (isOpen && modalElement) {
		// Set up focus trap
		const focusableElements = modalElement.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);
		firstFocusableElement = focusableElements[0] as HTMLElement;
		lastFocusableElement = focusableElements[focusableElements.length - 1] as HTMLElement;
		
		// Focus the first element
		setTimeout(() => firstFocusableElement?.focus(), 100);
	}

	// Theme toggle handler
	function toggleTheme() {
		themeStore.toggle();
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
		on:click={handleBackdropClick}
		on:keydown={trapFocus}
		transition:fade={{ duration: 200 }}
		role="dialog"
		aria-modal="true"
		aria-labelledby="settings-title"
	>
		<!-- Modal -->
		<div
			bind:this={modalElement}
			class="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-colors duration-200"
			transition:scale={{ duration: 200, start: 0.95 }}
		>
			<!-- Header -->
			<div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
				<h2 id="settings-title" class="text-xl font-semibold text-gray-900 dark:text-white">
					Settings
				</h2>
				<button
					type="button"
					class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
					on:click={close}
					aria-label="Close settings"
				>
					<Icon name="x" size={20} />
				</button>
			</div>

			<!-- Content -->
			<div class="p-6 space-y-6">
				<!-- Theme Section -->
				<div class="space-y-3">
					<h3 class="text-sm font-medium text-gray-900 dark:text-white">Appearance</h3>
					
					<!-- Theme Toggle -->
					<div class="flex items-center justify-between">
						<div class="flex items-center space-x-3">
							<div class="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
								<Icon 
									name={$themeStore === 'dark' ? 'moon' : 'sun'} 
									size={16} 
									extraClass="text-gray-600 dark:text-gray-300" 
								/>
							</div>
							<div>
								<p class="text-sm font-medium text-gray-900 dark:text-white">
									Dark mode
								</p>
								<p class="text-xs text-gray-500 dark:text-gray-400">
									Toggle between light and dark themes
								</p>
							</div>
						</div>
						
						<!-- Toggle Switch -->
						<button
							type="button"
							class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 {$themeStore === 'dark' ? 'bg-blue-600' : 'bg-gray-200'}"
							on:click={toggleTheme}
							role="switch"
							aria-checked={$themeStore === 'dark'}
							aria-label="Toggle dark mode"
						>
							<span
								class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 {$themeStore === 'dark' ? 'translate-x-6' : 'translate-x-1'}"
							/>
						</button>
					</div>
				</div>

				<!-- Future Settings Sections -->
				<div class="space-y-3">
					<h3 class="text-sm font-medium text-gray-900 dark:text-white">Preferences</h3>
					<div class="space-y-2">
						<div class="flex items-center justify-between py-2 opacity-50">
							<div class="flex items-center space-x-3">
								<div class="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
									<Icon name="bell" size={16} extraClass="text-gray-600 dark:text-gray-300" />
								</div>
								<div>
									<p class="text-sm font-medium text-gray-900 dark:text-white">
										Notifications
									</p>
									<p class="text-xs text-gray-500 dark:text-gray-400">
										Coming soon
									</p>
								</div>
							</div>
						</div>
						
						<div class="flex items-center justify-between py-2 opacity-50">
							<div class="flex items-center space-x-3">
								<div class="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
									<Icon name="globe" size={16} extraClass="text-gray-600 dark:text-gray-300" />
								</div>
								<div>
									<p class="text-sm font-medium text-gray-900 dark:text-white">
										Language
									</p>
									<p class="text-xs text-gray-500 dark:text-gray-400">
										Coming soon
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Footer -->
			<div class="px-6 py-4 bg-gray-50 dark:bg-gray-750 rounded-b-xl border-t border-gray-200 dark:border-gray-700">
				<div class="flex justify-end">
					<button
						type="button"
						class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-150"
						on:click={close}
					>
						Done
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Ensure smooth transitions for theme changes */
	:global(html) {
		transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
	}
	
	/* Custom scrollbar for dark mode */
	:global(.dark) {
		color-scheme: dark;
	}
</style>
