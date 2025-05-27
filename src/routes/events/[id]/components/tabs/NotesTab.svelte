<!-- src/routes/events/[id]/components/tabs/NotesTab.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Icon from '$lib/components/ui/Icon.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    
    export let event: any;
    export let canEdit: boolean = false;
    
    const dispatch = createEventDispatcher();
    
    function handleEditNotes() {
      dispatch('editNotes');
    }
  </script>
  
  <div class="bg-white rounded-lg shadow p-4">
    <div class="flex justify-between items-start mb-4">
      <h2 class="text-lg font-semibold">Event Notes</h2>
      {#if canEdit}
        <Button variant="outline" on:click={handleEditNotes}>
          <Icon name="edit" size={16} extraClass="mr-1" />
          Edit Notes
        </Button>
      {/if}
    </div>
  
    {#if event.notes}
      <div class="whitespace-pre-line p-4 bg-gray-50 rounded-md min-h-[200px]">
        {event.notes}
      </div>
    {:else}
      <div class="p-8 text-center text-gray-500 bg-gray-50 rounded-md min-h-[200px]">
        <p>No notes have been added for this event.</p>
        {#if canEdit}
          <Button className="mt-4" on:click={handleEditNotes}>Add Notes</Button>
        {/if}
      </div>
    {/if}
  </div>