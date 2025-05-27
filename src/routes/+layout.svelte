<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Icon from '$lib/components/ui/Icon.svelte';
	import SettingsModal from '$lib/components/ui/SettingsModal.svelte';
	import { themeStore } from '$lib/stores/themeStore';
	import '../app.css';

	let showMobileMenu = false;
	let showSettingsModal = false;

	const navItems = [
		{ href: '/', label: 'Dashboard', icon: 'home' },
		{ href: '/events', label: 'Events', icon: 'calendar' },
		{ href: '/clients', label: 'Clients', icon: 'users' },
		{ href: '/performers', label: 'Performers', icon: 'star' },
		{ href: '/agents', label: 'Agents', icon: 'briefcase' },
		{ href: '/tasks', label: 'Tasks', icon: 'check-square' }
	];

	$: getIsActive = (href: string) => {
		if (!$page.url) return false;
		if (href === '/') {
			return $page.url.pathname === '/';
		}
		return $page.url.pathname?.startsWith(href);
	};

	$: if ($page.url?.pathname) {
		showMobileMenu = false;
	}

	// Initialize theme on mount
	onMount(() => {
		themeStore.init();
	});

	// Settings modal handlers
	function openSettings() {
		showSettingsModal = true;
	}

	function closeSettings() {
		showSettingsModal = false;
	}
</script>

<svelte:head>
	<title>CircusSync - Production Company Management</title>
	<meta name="description" content="Manage your entertainment production company with CircusSync" />
	<link rel="icon" href="/favicon.png" />
</svelte:head>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col transition-colors duration-200">
	<div class="bg-white dark:bg-gray-800 shadow sticky top-0 z-30 transition-colors duration-200">
		<div class="mx-auto px-2 sm:px-4 lg:px-8">
			<div class="flex justify-between h-16">
				<div class="flex">
					<div class="flex items-center">
						<button
							class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 lg:hidden hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-150"
							on:click={() => (showMobileMenu = !showMobileMenu)}
							aria-label="Toggle menu"
							aria-expanded={showMobileMenu}
						>
							<span class="sr-only">Open main menu</span>
							<Icon name={showMobileMenu ? 'x' : 'menu'} extraClass="block h-6 w-6" />
						</button>
						<a href="/" class="flex-shrink-0 flex items-center ml-2 lg:ml-0">
							<span
								class="h-8 w-8 flex items-center justify-center rounded-md bg-blue-600 text-white font-bold text-sm"
								>CS</span
							>
							<span
								class="ml-2 text-xl font-bold text-gray-900 dark:text-white hidden sm:inline transition-colors duration-200"
								>CircusSync</span
							>
						</a>
					</div>
					<div class="hidden lg:ml-6 lg:flex lg:space-x-1">
						{#each navItems as item}
							<a
								href={item.href}
								class="px-3 py-2 rounded-md text-sm font-medium flex items-center my-auto transition-colors duration-150
                {getIsActive(item.href)
									? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
									: 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'}"
								aria-current={getIsActive(item.href) ? 'page' : undefined}
							>
								<Icon name={item.icon} size={16} extraClass="mr-1.5 flex-shrink-0" />
								{item.label}
							</a>
						{/each}
					</div>
				</div>

				<!-- Settings Button -->
				<div class="flex items-center">
					<button
						type="button"
						class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-150"
						on:click={openSettings}
						aria-label="Open settings"
						title="Settings"
					>
						<Icon name="settings" size={20} />
					</button>
				</div>
			</div>
		</div>
		{#if showMobileMenu}
			<div class="lg:hidden border-t border-gray-200 dark:border-gray-700" id="mobile-menu">
				<div class="px-2 pt-2 pb-3 space-y-1">
					{#each navItems as item}
						<a
							href={item.href}
							class="flex px-3 py-2 rounded-md text-base font-medium items-center transition-colors duration-150
              {getIsActive(item.href)
								? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
								: 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'}"
							aria-current={getIsActive(item.href) ? 'page' : undefined}
						>
							<Icon name={item.icon} size={20} extraClass="mr-3 flex-shrink-0" />
							{item.label}
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<main class="flex-grow">
		<slot />
	</main>

	<footer
		class="py-4 text-center text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200"
	>
		© {new Date().getFullYear()} CircusSync. All rights reserved.
	</footer>
</div>

<!-- Settings Modal -->
<SettingsModal bind:isOpen={showSettingsModal} on:close={closeSettings} />
