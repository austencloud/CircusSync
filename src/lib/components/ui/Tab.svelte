  <!-- src/lib/components/ui/Tab.svelte -->
  <script lang="ts">
    export let label: string;
    export let active = false;
    export let disabled = false;
    export let icon: string | null = null;
    export let badge: string | null = null;
  </script>
  
  <button
    class="px-4 py-2 border-b-2 text-sm font-medium whitespace-nowrap {
      active
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    } {disabled ? 'opacity-50 cursor-not-allowed' : ''}"
    disabled={disabled}
    on:click
  >
    <div class="flex items-center">
      {#if icon}
        <span class="mr-2">
          <slot name="icon" />
        </span>
      {/if}
      
      {label}
      
      {#if badge}
        <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {badge}
        </span>
      {/if}
    </div>
  </button>
  
