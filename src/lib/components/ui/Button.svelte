<!-- src/lib/components/ui/Button.svelte -->
<script lang="ts">
    export let variant: 'default' | 'outline' | 'text' = 'default';
    export let color: 'blue' | 'green' | 'red' | 'amber' | 'gray' = 'blue';
    export let size: 'sm' | 'md' | 'lg' = 'md';
    export let disabled = false;
    export let loading = false;
    export let href: string | null = null;
    export let type: 'button' | 'submit' | 'reset' = 'button';
    export let fullWidth = false;
    export let class: string = '';
    
    // Compute classes based on props
    $: variantClasses = {
      default: {
        blue: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
        green: 'bg-green-600 hover:bg-green-700 text-white border-transparent',
        red: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
        amber: 'bg-amber-600 hover:bg-amber-700 text-white border-transparent',
        gray: 'bg-gray-600 hover:bg-gray-700 text-white border-transparent',
      },
      outline: {
        blue: 'bg-white hover:bg-blue-50 text-blue-700 border-blue-300',
        green: 'bg-white hover:bg-green-50 text-green-700 border-green-300',
        red: 'bg-white hover:bg-red-50 text-red-700 border-red-300',
        amber: 'bg-white hover:bg-amber-50 text-amber-700 border-amber-300',
        gray: 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300',
      },
      text: {
        blue: 'bg-transparent hover:bg-blue-50 text-blue-700 border-transparent',
        green: 'bg-transparent hover:bg-green-50 text-green-700 border-transparent',
        red: 'bg-transparent hover:bg-red-50 text-red-700 border-transparent',
        amber: 'bg-transparent hover:bg-amber-50 text-amber-700 border-transparent',
        gray: 'bg-transparent hover:bg-gray-50 text-gray-700 border-transparent',
      },
    };
    
    $: sizeClasses = {
      sm: 'py-1 px-3 text-sm',
      md: 'py-2 px-4 text-sm',
      lg: 'py-3 px-6 text-base',
    };
    
    $: disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
    $: loadingClasses = loading ? 'opacity-70 cursor-wait' : '';
    $: widthClasses = fullWidth ? 'w-full' : '';
    
    $: classList = [
      'inline-flex items-center justify-center rounded-md font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
      variantClasses[variant][color],
      sizeClasses[size],
      disabledClasses,
      loadingClasses,
      widthClasses,
      class,
    ].join(' ');
  </script>
  
  {#if href}
    <a
      {href}
      class={classList}
      role="button"
      aria-disabled={disabled}
      on:click
      on:mouseenter
      on:mouseleave
    >
      {#if loading}
        <span class="mr-2 inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      {/if}
      <slot />
    </a>
  {:else}
    <button
      {type}
      class={classList}
      disabled={disabled || loading}
      on:click
      on:mouseenter
      on:mouseleave
    >
      {#if loading}
        <span class="mr-2 inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      {/if}
      <slot />
    </button>
  {/if}
  

