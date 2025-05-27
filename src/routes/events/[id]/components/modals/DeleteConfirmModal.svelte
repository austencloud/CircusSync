<!-- src/routes/events/[id]/components/modals/DeleteConfirmModal.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
    
    export let isLoading: boolean = false;
    
    const dispatch = createEventDispatcher();
    
    function handleConfirm() {
      dispatch('confirm');
    }
    
    function handleCancel() {
      dispatch('cancel');
    }
  </script>
  
  <ConfirmDialog
    title="Delete Event"
    message="Are you sure you want to delete this event? This action cannot be undone."
    confirmText="Delete Event"
    confirmColor="red"
    on:confirm={handleConfirm}
    on:cancel={handleCancel}
    {isLoading}
  />