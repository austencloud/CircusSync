<!-- src/routes/events/[id]/components/modals/EditEventModal.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Modal from '$lib/components/ui/Modal.svelte';
    import EventForm from '$lib/components/events/EventForm.svelte';
    
    export let event: any;
    
    const dispatch = createEventDispatcher();
    
    function handleSubmit(e: { detail: any; }) {
      dispatch('submit', e.detail);
    }
    
    function handleClose() {
      dispatch('close');
    }
  </script>
  
  <Modal title="Edit Event" on:close={handleClose} size="lg">
    <EventForm
      event={event}
      on:submit={handleSubmit}
      on:cancel={handleClose}
    />
  </Modal>