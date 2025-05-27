<!-- src/routes/events/[id]/components/modals/EditNotesModal.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Modal from '$lib/components/ui/Modal.svelte';
    
    export let notes: string = '';
    
    const dispatch = createEventDispatcher();
    
    function handleSubmit() {
      dispatch('submit', notes);
    }
    
    function handleClose() {
      dispatch('close');
    }
  </script>
  
  <Modal title="Edit Event Notes" on:close={handleClose} size="md">
    <textarea
      bind:value={notes}
      rows="10"
      class="w-full border p-2 rounded-md"
      placeholder="Enter event notes..."
    ></textarea>
    <div class="mt-4 flex justify-end gap-2">
      <Button variant="outline" on:click={handleClose}>Cancel</Button>
      <Button on:click={handleSubmit}>
        Save Notes
      </Button>
    </div>
  </Modal>