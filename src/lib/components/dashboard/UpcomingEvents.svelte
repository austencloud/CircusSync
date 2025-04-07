  <!-- src/lib/components/dashboard/UpcomingEvents.svelte -->
  <script lang="ts">
    import { format } from 'date-fns';
    import type { Event } from '$lib/types';
    import Icon from '$lib/components/ui/Icon.svelte';
    import { goto } from '$app/navigation';
    
    export let events: Event[] = [];
    
    function getStatusColor(status: Event['status']): string {
      switch(status) {
        case 'confirmed':
          return 'bg-green-100 text-green-800';
        case 'deposit-received':
          return 'bg-blue-100 text-blue-800';
        case 'inquiry':
          return 'bg-gray-100 text-gray-800';
        case 'completed':
          return 'bg-purple-100 text-purple-800';
        case 'cancelled':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
    
    function getStatusLabel(status: Event['status']): string {
      switch(status) {
        case 'confirmed':
          return 'Confirmed';
        case 'deposit-received':
          return 'Deposit Received';
        case 'inquiry':
          return 'Inquiry';
        case 'completed':
          return 'Completed';
        case 'cancelled':
          return 'Cancelled';
        default:
          return status;
      }
    }
    
    function viewEvent(id: string) {
      goto(`/events/${id}`);
    }
  </script>
  
  {#if events.length === 0}
    <div class="py-4 text-center text-gray-500">
      <p>No upcoming events found</p>
    </div>
  {:else}
    <ul class="divide-y">
      {#each events as event}
        <li>
          <button 
            type="button" 
            class="w-full text-left py-3 cursor-pointer hover:bg-gray-50" 
            on:click={() => viewEvent(event.id)} 
            on:keydown={(e) => e.key === 'Enter' && viewEvent(event.id)}
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="font-medium">{event.name}</p>
                <p class="text-sm text-gray-600">{format(event.date, 'MMM d, yyyy')}</p>
                <p class="text-sm text-gray-500 mt-1">
                  <span class="inline-flex items-center">
                    <Icon name="users" size={14} class="mr-1" />
                    {event.performers.length} performers
                  </span>
                  <span class="inline-flex items-center ml-3">
                    <Icon name="map-pin" size={14} class="mr-1" />
                    {event.location.address.split(',')[0]}
                  </span>
                </p>
              </div>
              
              <div>
                <span class="inline-block px-2 py-1 text-xs rounded-full {getStatusColor(event.status)}">
                  {getStatusLabel(event.status)}
                </span>
              </div>
            </div>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
  
  <div class="mt-3 text-right">
    <a href="/events" class="text-blue-600 hover:underline text-sm font-medium flex items-center justify-end">
      View all events
      <Icon name="arrow-right" size={16} class="ml-1" />
    </a>
  </div>
  
