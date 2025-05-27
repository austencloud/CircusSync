<!-- src/routes/events/[id]/components/tabs/ClientInfoTab.svelte -->
<script lang="ts">
    import { format } from 'date-fns';
    import Icon from '$lib/components/ui/Icon.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    
    export let client: any;
    export let canEdit: boolean = false;
  </script>
  
  {#if client}
    <div class="bg-white rounded-lg shadow p-4">
      <div class="flex justify-between items-start mb-4">
        <h2 class="text-lg font-semibold">Client Information</h2>
        {#if canEdit}
          <Button href="/clients/{client.id}" variant="outline">
            <Icon name="external-link" size={16} extraClass="mr-1" />
            View Full Profile
          </Button>
        {/if}
      </div>
  
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <div class="mb-4">
            <h3 class="text-sm font-medium text-gray-500">Contact Information</h3>
            <div class="mt-2">
              <p class="font-medium text-lg">{client.name}</p>
              <p class="text-gray-700">Contact: {client.contactPerson}</p>
              <div class="mt-3 text-sm space-y-2">
                <div class="flex items-center">
                  <Icon name="mail" size={14} extraClass="text-gray-400 mr-2" />
                  <a href="mailto:{client.email}" class="text-blue-600 hover:underline">
                    {client.email}
                  </a>
                </div>
                <div class="flex items-center">
                  <Icon name="phone" size={14} extraClass="text-gray-400 mr-2" />
                  <a href="tel:{client.phone}" class="text-blue-600 hover:underline">
                    {client.phone}
                  </a>
                </div>
                <div class="flex items-start">
                  <Icon name="map-pin" size={14} extraClass="text-gray-400 mr-2 mt-1" />
                  <p class="flex-1">{client.address}</p>
                </div>
              </div>
            </div>
          </div>
  
          <div>
            <h3 class="text-sm font-medium text-gray-500">History & Status</h3>
            <div class="mt-2 space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">Client Status:</span>
                <span class="font-medium capitalize">{client.status}</span>
              </div>
              {#if client.lastPerformed}
                <div class="flex justify-between">
                  <span class="text-gray-600">Last Event:</span>
                  <span>{format(client.lastPerformed, 'MMM d, yyyy')}</span>
                </div>
              {/if}
              {#if client.lastContacted}
                <div class="flex justify-between">
                  <span class="text-gray-600">Last Contacted:</span>
                  <span>{format(client.lastContacted, 'MMM d, yyyy')}</span>
                </div>
              {/if}
            </div>
          </div>
        </div>
  
        <div>
          {#if client.eventTypes && client.eventTypes.length > 0}
            <div class="mb-4">
              <h3 class="text-sm font-medium text-gray-500">Event Types</h3>
              <div class="mt-2 flex flex-wrap gap-1">
                {#each client.eventTypes as eventType}
                  <span
                    class="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                  >
                    {eventType}
                  </span>
                {/each}
              </div>
            </div>
          {/if}
  
          {#if client.servicesUsed && client.servicesUsed.length > 0}
            <div class="mb-4">
              <h3 class="text-sm font-medium text-gray-500">Services Used</h3>
              <div class="mt-2 flex flex-wrap gap-1">
                {#each client.servicesUsed as service}
                  <span
                    class="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800"
                  >
                    {service}
                  </span>
                {/each}
              </div>
            </div>
          {/if}
  
          {#if client.nextFollowUp && client.nextFollowUp.task}
            <div class="mb-4">
              <h3 class="text-sm font-medium text-gray-500">Follow-Up</h3>
              <div class="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div class="flex items-start">
                  <Icon name="bell" size={16} extraClass="text-amber-600 mr-2 mt-1" />
                  <div>
                    <p class="font-medium text-amber-800">{client.nextFollowUp.task}</p>
                    {#if client.nextFollowUp.date}
                      <p class="text-sm text-amber-700 mt-1">
                        Follow up by: {format(client.nextFollowUp.date, 'MMM d, yyyy')}
                      </p>
                    {/if}
                  </div>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
  
      {#if client.notes}
        <div class="mt-4 pt-4 border-t">
          <h3 class="text-sm font-medium text-gray-500">Client Notes</h3>
          <div class="mt-2 p-3 bg-gray-50 rounded-md whitespace-pre-line">
            {client.notes}
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <div class="bg-white rounded-lg shadow p-8 text-center">
      <p class="text-gray-500">No client information available for this event.</p>
    </div>
  {/if}