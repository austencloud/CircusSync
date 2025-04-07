<!-- src/routes/+layout.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { user, loading as authLoading } from '$lib/services/auth';
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
      { href: '/tasks', label: 'Tasks', icon: 'check-square' },
    ];
    
    // Check if a nav item is active
    $: getIsActive = (href: string) => {
      if (href === '/') {
        return $page.url.pathname === '/';
      }
      return $page.url.pathname.startsWith(href);
    };
    
    // Close mobile menu on navigation
    $: if ($page.url.pathname) {
      showMobileMenu = false;
    }
    
    // Handle logout
    function handleLogout() {
      // This would be handled by your auth service
      goto('/login');
    }
  </script>
  
  <svelte:head>
    <title>CircusSync - Production Company Management</title>
    <meta name="description" content="Manage your entertainment production company with CircusSync" />
  </svelte:head>
  
  {#if $authLoading}
    <div class="h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  {:else if !$user}
    <!-- Auth flow will handle redirects, but as a fallback show slot content for login/register pages -->
    <slot />
  {:else}
    <div class="min-h-screen bg-gray-100">
      <!-- Top Navigation Bar -->
      <div class="bg-white shadow">
        <div class="mx-auto px-2 sm:px-4 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex">
              <!-- Logo & Mobile Menu Button -->
              <div class="flex items-center">
                <button 
                  class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 lg:hidden hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  on:click={() => showMobileMenu = !showMobileMenu}
                >
                  <span class="sr-only">Open main menu</span>
                  <Icon name={showMobileMenu ? 'x' : 'menu'} class="block h-6 w-6" />
                </button>
                
                <a href="/" class="flex-shrink-0 flex items-center">
                  <!-- App Logo -->
                  <span class="h-8 w-8 flex items-center justify-center rounded-md bg-blue-600 text-white">CS</span>
                  <span class="ml-2 text-xl font-bold text-gray-900">CircusSync</span>
                </a>
              </div>
              
              <!-- Desktop Navigation -->
              <div class="hidden lg:ml-6 lg:flex lg:space-x-4">
                {#each navItems as item}
                  <a 
                    href={item.href} 
                    class="
                      px-3 py-2 rounded-md text-sm font-medium flex items-center
                      {getIsActive(item.href) 
                        ? 'text-blue-700 bg-blue-50 hover:bg-blue-100' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    "
                  >
                    <Icon name={item.icon} size={18} class="mr-1.5" />
                    {item.label}
                  </a>
                {/each}
              </div>
            </div>
            
            <!-- Right side actions -->
            <div class="flex items-center">
              <!-- Notifications -->
              <button class="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <span class="sr-only">View notifications</span>
                <div class="relative">
                  <Icon name="bell" size={24} />
                  <span class="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    3
                  </span>
                </div>
              </button>
              
              <!-- User Menu -->
              <div class="ml-4 relative flex-shrink-0">
                <div>
                  <button 
                    type="button" 
                    class="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <span class="sr-only">Open user menu</span>
                    
                    {#if $user.photoURL}
                      <img
                        class="h-8 w-8 rounded-full"
                        src={$user.photoURL}
                        alt="User profile"
                      />
                    {:else}
                      <div class="h-8 w-8 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                        {$user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                    {/if}
                  </button>
                </div>
                
                <!-- User Dropdown Menu (would need JS to toggle) -->
                <div class="hidden origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <a href="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Your Profile
                  </a>
                  <a href="/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Settings
                  </a>
                  <button 
                    class="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                    on:click={handleLogout}
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Mobile Menu (expanded) -->
        {#if showMobileMenu}
          <div class="lg:hidden bg-white">
            <div class="px-2 pt-2 pb-3 space-y-1">
              {#each navItems as item}
                <a 
                  href={item.href} 
                  class="
                    block px-3 py-2 rounded-md text-base font-medium flex items-center
                    {getIsActive(item.href) 
                      ? 'text-blue-700 bg-blue-50' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  "
                >
                  <Icon name={item.icon} size={18} class="mr-2" />
                  {item.label}
                </a>
              {/each}
            </div>
          </div>
        {/if}
      </div>
      
      <!-- Main Content -->
      <main>
        <slot />
      </main>
    </div>
  {/if}