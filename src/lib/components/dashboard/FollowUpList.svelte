  
  <!-- src/lib/components/dashboard/FollowUpList.svelte -->
  <script lang="ts">
    import { format } from 'date-fns';
    import type { Client } from '$lib/types';
    import Icon from '$lib/components/ui/Icon.svelte';
    import { goto } from '$app/navigation';
    
    export let clients: Client[] = [];
    
    function isOverdue(date: Date | null): boolean {
      if (!date) return false;
      return new Date() > date;
    }
    
    function navigateToClient(id: string) {
      goto(`/clients/${id}`);
    }
  </script>
  
  {#if clients.length === 0}
    <div class="py-4 text-center text-gray-500">
      <p>No follow-ups needed</p>
    </div>
  {:else}
    <ul class="divide-y">
      {#each clients as client}
        <li>
          <button 
            type="button" 
            class="w-full py-3 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-md"
            on:click={() => navigateToClient(client.id)}
            on:keydown={(e) => e.key === 'Enter' && navigateToClient(client.id)}
          >
            <div class="flex justify-between">
              <div>
                <p class="font-medium">{client.name}</p>
                <p class="text-sm text-gray-600">{client.contactPerson}</p>
                
                {#if client.nextFollowUp.task}
                  <p class="text-sm mt-1 {isOverdue(client.nextFollowUp.date) ? 'text-red-600' : 'text-gray-600'}">
                    {client.nextFollowUp.task}
                  </p>
                {/if}
              </div>
              
              {#if client.nextFollowUp.date}
                <div>
                  <span class="inline-block px-2 py-1 text-xs rounded-full {isOverdue(client.nextFollowUp.date) ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}">
                    {isOverdue(client.nextFollowUp.date) ? 'Overdue' : format(client.nextFollowUp.date, 'MMM d')}
                  </span>
                </div>
              {/if}
            </div>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
  
  <div class="mt-3 text-right">
    <a href="/clients?filter=follow-up" class="text-blue-600 hover:underline text-sm font-medium flex items-center justify-end">
      View all follow-ups
      <Icon name="arrow-right" size={16} extraClass="ml-1" />
    </a>
  </div>