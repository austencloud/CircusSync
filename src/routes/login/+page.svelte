<!-- src/routes/login/+page.svelte -->
<script lang="ts">
    import { goto } from '$app/navigation';
    import { fade } from 'svelte/transition';
    import { signIn } from '$lib/services/auth';
    import Button from '$lib/components/ui/Button.svelte';
    import Icon from '$lib/components/ui/Icon.svelte';
    
    // Form state
    let email = '';
    let password = '';
    let rememberMe = false;
    let loading = false;
    let error: string | null = null;
    
    // Handle login form submission
    async function handleLogin() {
      // Reset error state
      error = null;
      
      // Validate form
      if (!email) {
        error = 'Email is required';
        return;
      }
      
      if (!password) {
        error = 'Password is required';
        return;
      }
      
      // Start loading
      loading = true;
      
      try {
        // Attempt to sign in
        await signIn(email, password);
        
        // Redirect to dashboard on success
        goto('/');
      } catch (err: any) {
        // Handle errors
        error = err.message || 'Failed to sign in';
      } finally {
        loading = false;
      }
    }
  </script>
  
  <svelte:head>
    <title>Login - CircusSync</title>
  </svelte:head>
  
  <div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <!-- App Logo and Name -->
      <div class="flex items-center justify-center">
        <div class="h-12 w-12 flex items-center justify-center rounded-lg bg-blue-600 text-white text-2xl font-bold">
          CS
        </div>
      </div>
      <h2 class="mt-3 text-center text-3xl font-extrabold text-gray-900">
        CircusSync
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Production Company Management
      </p>
    </div>
  
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">
          Sign in to your account
        </h2>
        
        <!-- Error message -->
        {#if error}
          <div 
            class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm"
            transition:fade
          >
            <div class="flex">
              <Icon name="alert-circle" size={16} class="flex-shrink-0 mr-2 mt-0.5" />
              <span>{error}</span>
            </div>
          </div>
        {/if}
        
        <form class="space-y-6" on:submit|preventDefault={handleLogin}>
          <!-- Email field -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div class="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                bind:value={email}
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
  
          <!-- Password field -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div class="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                bind:value={password}
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
  
          <!-- Remember me checkbox and Forgot Password link -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                bind:checked={rememberMe}
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
  
            <div class="text-sm">
              <a href="/forgot-password" class="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </a>
            </div>
          </div>
  
          <!-- Submit button -->
          <div>
            <Button
              type="submit"
              fullWidth={true}
              loading={loading}
              disabled={loading}
              size="lg"
            >
              Sign in
            </Button>
          </div>
        </form>
  
        <!-- Social Login section -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>
  
          <div class="mt-6 grid grid-cols-2 gap-3">
            <div>
              <a
                href="#"
                class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span class="sr-only">Sign in with Google</span>
                <!-- Simplified Google icon -->
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5C13.6168 5 15.1013 5.55556 16.2863 6.47078L19.9235 3C17.8091 1.14444 15.0393 0 12 0C7.3924 0 3.39667 2.60589 1.32222 6.47656L5.45023 9.67589C6.46477 6.98956 9.01932 5 12 5Z" fill="#EA4335"/>
                  <path d="M23.8961 12.2678C23.9586 11.8477 24 11.4219 24 11C24 10.6614 23.9738 10.3136 23.9176 9.97339H12V14.9829H18.4592C18.0457 16.4276 17.0546 17.6375 15.694 18.4162L19.7453 21.5512C21.9802 19.4447 23.4201 16.124 23.8961 12.2678Z" fill="#4285F4"/>
                  <path d="M5 12C5 11.1566 5.14996 10.3516 5.40625 9.57422L1.31818 6.5C0.478693 7.85848 0 9.37027 0 11C0 12.6206 0.470773 14.148 1.31818 15.5L5.4019 12.4198C5.14375 11.6427 5 10.8453 5 10V12Z" fill="#FBBC05"/>
                  <path d="M12 19C9.0039 19 6.46853 17.0478 5.44803 14.422L1.31865 17.5746C3.3839 21.4334 7.37431 24 12 24C15.0498 24 17.8166 22.886 19.9339 21L15.6933 18C14.6456 18.6547 13.3739 19 12 19Z" fill="#34A853"/>
                </svg>
              </a>
            </div>
  
            <div>
              <a
                href="#"
                class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span class="sr-only">Sign in with Microsoft</span>
                <!-- Simplified Microsoft icon -->
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.4 2H2V11.4H11.4V2Z" fill="#F25022"/>
                  <path d="M22 2H12.6V11.4H22V2Z" fill="#7FBA00"/>
                  <path d="M11.4 12.6H2V22H11.4V12.6Z" fill="#00A4EF"/>
                  <path d="M22 12.6H12.6V22H22V12.6Z" fill="#FFB900"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <!-- Sign up link -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Don't have an account?
            <a href="/register" class="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
    
    <!-- Footer text -->
    <div class="mt-8 text-center text-xs text-gray-500">
      <p>© {new Date().getFullYear()} CircusSync. All rights reserved.</p>
    </div>
  </div>