
<!-- src/lib/components/ui/ConfirmDialog.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  import Button from './Button.svelte';
  
  export let title = 'Confirm';
  export let message = 'Are you sure?';
  export let confirmText = 'Confirm';
  export let cancelText = 'Cancel';
  export let confirmColor: 'blue' | 'green' | 'red' | 'amber' = 'blue';
  export let isLoading = false;
  
  const dispatch = createEventDispatcher();
  
  function confirm() {
    dispatch('confirm');
  }
  
  function cancel() {
    dispatch('cancel');
  }
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
  transition:fade={{ duration: 200 }}
>
  <div
    class="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden"
    transition:fade={{ duration: 150, delay: 50 }}
  >
    <div class="p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-2">{title}</h2>
      <p class="text-gray-600">{message}</p>
    </div>
    
    <div class="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
      <Button
        variant="outline"
        color="gray"
        on:click={cancel}
        disabled={isLoading}
      >
        {cancelText}
      </Button>
      
      <Button
        color={confirmColor}
        on:click={confirm}
        loading={isLoading}
        disabled={isLoading}
      >
        {confirmText}
      </Button>
    </div>
  </div>
</div>

