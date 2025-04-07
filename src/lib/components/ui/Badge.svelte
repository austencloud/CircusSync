  <!-- src/lib/components/ui/Badge.svelte -->
  <script lang="ts">
    export let color: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'gray' = 'blue';
    export let variant: 'solid' | 'outline' = 'solid';
    export let size: 'sm' | 'md' = 'sm';
    export let className: string = '';
    
    // Compute classes based on props
    $: variantClasses = {
      solid: {
        blue: 'bg-blue-100 text-blue-800',
        green: 'bg-green-100 text-green-800',
        red: 'bg-red-100 text-red-800',
        amber: 'bg-amber-100 text-amber-800',
        purple: 'bg-purple-100 text-purple-800',
        gray: 'bg-gray-100 text-gray-800',
      },
      outline: {
        blue: 'bg-white text-blue-700 border border-blue-200',
        green: 'bg-white text-green-700 border border-green-200',
        red: 'bg-white text-red-700 border border-red-200',
        amber: 'bg-white text-amber-700 border border-amber-200',
        purple: 'bg-white text-purple-700 border border-purple-200',
        gray: 'bg-white text-gray-700 border border-gray-200',
      }
    };
    
    $: sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm',
    };
    
    $: classList = [
      'inline-flex items-center font-medium rounded-full',
      variantClasses[variant][color],
      sizeClasses[size],
      className,
    ].join(' ');
  </script>
  
  <span class={classList}>
    <slot />
  </span>
  
