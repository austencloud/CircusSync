<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { user, loading as authLoading, initAuth, authStore } from '$lib/services/auth';
	import Icon from '$lib/components/ui/Icon.svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
	import '../app.css';

	let showMobileMenu = false;

	// Navigation items
	const navItems = [
		{ href: '/', label: 'Dashboard', icon: 'home' },
		{ href: '/events', label: 'Events', icon: 'calendar' },
		{ href: '/clients', label: 'Clients', icon: 'users' },
		{ href: '/performers', label: 'Performers', icon: 'star' },
		{ href: '/agents', label: 'Agents', icon: 'briefcase' },
		{ href: '/tasks', label: 'Tasks', icon: 'check-square' }
	];

	// Check if a nav item is active (Guarded)
	$: getIsActive = (href: string) => {
		if (!$page.url) return false;
		if (href === '/') {
			return $page.url.pathname === '/';
		}
		return $page.url.pathname?.startsWith(href);
	};

	// Close mobile menu on navigation (Guarded)
	$: if ($page.url?.pathname) {
		showMobileMenu = false;
	}

	// Handle logout (client-side only)
	async function handleLogout() {
		try {
			const authService = await import('$lib/services/auth');
			await authService.signOut();
		} catch (err) {
			console.error('Logout failed:', err);
		}
	}

	// Reactive check for non-auth pages (Guarded)
	$: isAuthPage =
		$page.url?.pathname === '/login' ||
		$page.url?.pathname === '/register' ||
		$page.url?.pathname === '/forgot-password';

	// Run client-side initialization and redirection logic after mount
	onMount(() => {
		console.log('Layout onMount: Initializing Auth...');
		initAuth();

		// --- Redirect Logic Moved Here ---
		// We need to wait for the auth state to potentially resolve first.
		// Subscribe to user and loading state changes.
		const unsubscribe = authStore.subscribe(currentAuth => {
			// Only redirect if auth is NOT loading, we have a definitive user state,
			// and we are not on an auth page.
			if (!currentAuth.loading && !currentAuth.user && !isAuthPage) {
				console.log("Redirecting to /login from layout onMount (auth state resolved)");
				goto('/login', { replaceState: true });
				// Unsubscribe after redirecting to prevent multiple triggers if needed
                // Although navigating away should handle this.
                // unsubscribe();
			}
		});

        // Clean up the subscription when the layout unmounts
        return () => {
            console.log("Layout onDestroy: Unsubscribing from authStore");
            unsubscribe();
        };
	});

</script>

<svelte:head>
	<title>CircusSync - Production Company Management</title>
	<meta name="description" content="Manage your entertainment production company with CircusSync" />
	<link rel="icon" href="/favicon.png" />
</svelte:head>

{#if $authLoading && !isAuthPage}
	<div class="h-screen flex items-center justify-center bg-gray-100">
		<LoadingSpinner size="lg" />
	</div>
{:else if !$user && !isAuthPage}
	<div class="h-screen flex items-center justify-center bg-gray-100">
		<p>Loading...</p>
        </div>
{:else if isAuthPage}
	<slot />
{:else}
	<div class="min-h-screen bg-gray-100 flex flex-col">
		<div class="bg-white shadow sticky top-0 z-30">
			<div class="mx-auto px-2 sm:px-4 lg:px-8">
				<div class="flex justify-between h-16">
					<div class="flex">
						<div class="flex items-center">
							<button
								class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 lg:hidden hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
								on:click={() => (showMobileMenu = !showMobileMenu)}
								aria-label="Toggle menu"
								aria-expanded={showMobileMenu}
							>
								<span class="sr-only">Open main menu</span>
								<Icon name={showMobileMenu ? 'x' : 'menu'} extraClass="block h-6 w-6" />
							</button>
							<a href="/" class="flex-shrink-0 flex items-center ml-2 lg:ml-0">
								<span class="h-8 w-8 flex items-center justify-center rounded-md bg-blue-600 text-white font-bold text-sm">CS</span>
								<span class="ml-2 text-xl font-bold text-gray-900 hidden sm:inline">CircusSync</span>
							</a>
						</div>
						<div class="hidden lg:ml-6 lg:flex lg:space-x-1">
							{#each navItems as item}
								<a
									href={item.href}
									class="px-3 py-2 rounded-md text-sm font-medium flex items-center my-auto
                    {getIsActive(item.href) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}"
									aria-current={getIsActive(item.href) ? 'page' : undefined}
								>
									<Icon name={item.icon} size={16} extraClass="mr-1.5 flex-shrink-0" />
									{item.label}
								</a>
							{/each}
						</div>
					</div>
					<div class="flex items-center">
						<button class="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative">
							<span class="sr-only">View notifications</span>
							<Icon name="bell" size={24} />
							<span class="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
						</button>
						<div class="ml-3 relative flex-shrink-0">
							<button
								type="button"
								class="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								id="user-menu-button" aria-expanded="false" aria-haspopup="true"
								on:click={handleLogout} title="Click to Logout (Dropdown TBD)"
							>
								<span class="sr-only">Open user menu</span>
								{#if $user?.photoURL}
									<img class="h-8 w-8 rounded-full object-cover" src={$user.photoURL} alt="User profile"/>
								{:else}
									<div class="h-8 w-8 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center">
										{($user?.name || 'U').split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
									</div>
								{/if}
							</button>
						</div>
					</div>
				</div>
			</div>
			{#if showMobileMenu}
				<div class="lg:hidden border-t border-gray-200" id="mobile-menu">
					<div class="px-2 pt-2 pb-3 space-y-1">
						{#each navItems as item}
							<a
								href={item.href}
								class="flex px-3 py-2 rounded-md text-base font-medium items-center 
                  {getIsActive(item.href) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}"
								aria-current={getIsActive(item.href) ? 'page' : undefined}
							>
								<Icon name={item.icon} size={20} extraClass="mr-3 flex-shrink-0" />
								{item.label}
							</a>
						{/each}
					</div>
					<div class="border-t border-gray-200 pt-4 pb-3">
						<div class="flex items-center px-4">
							<div class="flex-shrink-0">
								{#if $user?.photoURL}
									<img class="h-10 w-10 rounded-full object-cover" src={$user.photoURL} alt="User profile"/>
								{:else}
									<div class="h-10 w-10 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center">
										{($user?.name || 'U').split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
									</div>
								{/if}
							</div>
							<div class="ml-3">
								<div class="text-base font-medium text-gray-800">{$user?.name || 'User'}</div>
								<div class="text-sm font-medium text-gray-500">{$user?.email || ''}</div>
							</div>
						</div>
						<div class="mt-3 px-2 space-y-1">
							<a href="/profile" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Your Profile</a>
							<a href="/settings" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Settings</a>
							<button on:click={handleLogout} class="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-700 hover:text-gray-900 hover:bg-gray-50">
								Sign out
							</button>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<main class="flex-grow">
			<slot />
		</main>

		<footer class="py-4 text-center text-xs text-gray-500">
			© {new Date().getFullYear()} CircusSync. All rights reserved.
		</footer>
	</div>
{/if}
