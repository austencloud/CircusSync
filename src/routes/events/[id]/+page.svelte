<!-- src/routes/events/[id]/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { format } from 'date-fns';
    import { eventStore } from '$lib/stores/eventStore';
    import { clientStore } from '$lib/stores/clientStore';
    import { performerStore } from '$lib/stores/performerStore';
    import { user, checkUserRole } from '$lib/services/auth';
    import Icon from '$lib/components/ui/Icon.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Badge from '$lib/components/ui/Badge.svelte';
    import Tab from '$lib/components/ui/Tab.svelte';
    import Modal from '$lib/components/ui/Modal.svelte';
    import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
    import PerformerCard from '$lib/components/performers/PerformerCard.svelte';
    import ClientInfo from '$lib/components/clients/ClientInfo.svelte';
    import EventForm from '$lib/components/events/EventForm.svelte';
    import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
    
    // State management
    let loading = true;
    let activeTab = 'details';
    let showEditModal = false;
    let showDeleteConfirm = false;
    let isDeleting = false;
    
    // User permissions
    let canEdit: boolean;
    
    const eventId = $page.params.id;
    
    onMount(async () => {
      try {
        // Check if user has edit permissions
        const checkRole = checkUserRole('manager');
        canEdit = $checkRole;
        
        // Load event, client, and performers in parallel
        await Promise.all([
          eventStore.loadEvent(eventId),
          eventStore.loadPerformersForEvent(eventId),
        ]);
        
        // Load client info after we have the event
        if ($eventStore.selectedEvent?.client) {
          await clientStore.loadClient($eventStore.selectedEvent.client);
        }
      } catch (error) {
        console.error('Error loading event data:', error);
      } finally {
        loading = false;
      }
    });
    
    // Reactive variables based on store data
    $: event = $eventStore.selectedEvent;
    $: client = $clientStore.selectedClient;
    $: eventPerformers = $eventStore.eventPerformers;
    $: totalPay = eventPerformers.reduce((sum, p) => sum + p.pay, 0);
    $: profit = event?.payment.totalValue ? event.payment.totalValue - totalPay : 0;
    
    // Helper functions
    function getStatusColor(status: string): string {
      switch(status) {
        case 'confirmed':
          return 'green';
        case 'deposit-received':
          return 'blue';
        case 'inquiry':
          return 'gray';
        case 'completed':
          return 'purple';
        case 'cancelled':
          return 'red';
        default:
          return 'gray';
      }
    }
    
    function getStatusText(status: string): string {
      switch(status) {
        case 'deposit-received':
          return 'Deposit Received';
        default:
          return status.charAt(0).toUpperCase() + status.slice(1);
      }
    }
    
    async function handleDelete() {
      if (!event) return;
      
      isDeleting = true;
      
      try {
        await eventStore.deleteEvent(event.id);
        // Navigate to events page
        window.location.href = '/events';
      } catch (error) {
        console.error('Error deleting event:', error);
        isDeleting = false;
        showDeleteConfirm = false;
      }
    }
    
    async function handleStatusChange(newStatus: string) {
      if (!event) return;
      
      try {
        await eventStore.updateEvent(event.id, { status: newStatus as any });
      } catch (error) {
        console.error('Error updating event status:', error);
      }
    }
  </script>
  
  <svelte:head>
    <title>{event?.name || 'Event Details'} | CircusSync</title>
  </svelte:head>
  
  {#if loading}
    <div class="flex justify-center items-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  {:else if !event}
    <div class="p-6 text-center">
      <h1 class="text-2xl font-bold text-red-600 mb-2">Event Not Found</h1>
      <p class="text-gray-600 mb-4">The event you're looking for doesn't exist or you don't have permission to view it.</p>
      <Button href="/events">Back to Events</Button>
    </div>
  {:else}
    <!-- Event Header -->
    <div class="bg-white border-b">
      <div class="max-w-7xl mx-auto p-4 md:p-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <!-- Event Title and Basic Info -->
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-bold">{event.name}</h1>
              <Badge color={getStatusColor(event.status)}>{getStatusText(event.status)}</Badge>
            </div>
            
            <div class="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
              <div class="flex items-center">
                <Icon name="calendar" size={16} class="mr-1" />
                {format(event.date, 'EEEE, MMMM d, yyyy')}
              </div>
              
              <div class="flex items-center">
                <Icon name="clock" size={16} class="mr-1" />
                Performance: {event.performanceTime.start} - {event.performanceTime.end}
              </div>
              
              <div class="flex items-center">
                <Icon name="users" size={16} class="mr-1" />
                {eventPerformers.length} performer{eventPerformers.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          {#if canEdit}
            <div class="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                on:click={() => showEditModal = true}
              >
                <Icon name="edit" size={16} class="mr-1" />
                Edit Event
              </Button>
              
              <Button 
                variant="outline" 
                color="red"
                on:click={() => showDeleteConfirm = true}
              >
                <Icon name="trash-2" size={16} class="mr-1" />
                Delete
              </Button>
              
              <div class="relative group">
                <Button>
                  <Icon name="more-horizontal" size={16} />
                  Actions
                </Button>
                
                <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
                  <div class="py-1">
                    {#if event.status !== 'confirmed'}
                      <button 
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        on:click={() => handleStatusChange('confirmed')}
                      >
                        Mark as Confirmed
                      </button>
                    {/if}
                    
                    {#if event.status !== 'deposit-received' && event.deposit.required && !event.deposit.received}
                      <button 
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        on:click={() => handleStatusChange('deposit-received')}
                      >
                        Mark Deposit Received
                      </button>
                    {/if}
                    
                    {#if event.status !== 'completed'}
                      <button 
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        on:click={() => handleStatusChange('completed')}
                      >
                        Mark as Completed
                      </button>
                    {/if}
                    
                    {#if event.status !== 'cancelled'}
                      <button 
                        class="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                        on:click={() => handleStatusChange('cancelled')}
                      >
                        Mark as Cancelled
                      </button>
                    {/if}
                    
                    <a 
                      href="/events/{event.id}/contract" 
                      class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Generate Contract
                    </a>
                  </div>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
    
    <!-- Tabs Navigation -->
    <div class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex overflow-x-auto">
          <Tab 
            label="Details" 
            active={activeTab === 'details'} 
            on:click={() => activeTab = 'details'} 
          />
          <Tab 
            label="Performers" 
            active={activeTab === 'performers'} 
            on:click={() => activeTab = 'performers'} 
          />
          <Tab 
            label="Client Info" 
            active={activeTab === 'client'} 
            on:click={() => activeTab = 'client'} 
          />
          <Tab 
            label="Contract & Payment" 
            active={activeTab === 'contract'} 
            on:click={() => activeTab = 'contract'} 
          />
          <Tab 
            label="Notes" 
            active={activeTab === 'notes'} 
            on:click={() => activeTab = 'notes'} 
          />
        </div>
      </div>
    </div>
    
    <!-- Tab Content -->
    <div class="max-w-7xl mx-auto p-4 md:p-6">
      <!-- Details Tab -->
      {#if activeTab === 'details'}
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Event Details -->
          <div class="bg-white rounded-lg shadow p-4">
            <h2 class="text-lg font-semibold mb-4">Event Details</h2>
            
            <div class="space-y-4">
              <div>
                <h3 class="text-sm font-medium text-gray-500">Date & Time</h3>
                <div class="mt-1">
                  <div class="flex items-center">
                    <Icon name="calendar" size={16} class="text-gray-400 mr-2" />
                    <p>{format(event.date, 'EEEE, MMMM d, yyyy')}</p>
                  </div>
                  <div class="flex items-center mt-1">
                    <Icon name="clock" size={16} class="text-gray-400 mr-2" />
                    <p>Performance: {event.performanceTime.start} - {event.performanceTime.end}</p>
                  </div>
                  {#if event.callTime}
                    <div class="flex items-center mt-1">
                      <Icon name="alert-circle" size={16} class="text-gray-400 mr-2" />
                      <p>Call Time: {event.callTime}</p>
                    </div>
                  {/if}
                </div>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-500">Location</h3>
                <div class="mt-1">
                  <div class="flex items-start">
                    <Icon name="map-pin" size={16} class="text-gray-400 mr-2 mt-1" />
                    <p class="flex-1">{event.location.address}</p>
                  </div>
                  {#if event.location.notes}
                    <div class="flex items-start mt-1">
                      <Icon name="info" size={16} class="text-gray-400 mr-2 mt-1" />
                      <p class="flex-1">{event.location.notes}</p>
                    </div>
                  {/if}
                  {#if event.location.mapLink}
                    <div class="mt-2">
                      <a 
                        href={event.location.mapLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="text-blue-600 hover:underline text-sm inline-flex items-center"
                      >
                        <Icon name="external-link" size={14} class="mr-1" />
                        Open in Maps
                      </a>
                    </div>
                  {/if}
                </div>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-500">Services</h3>
                <div class="mt-1 flex flex-wrap gap-1">
                  {#each event.services as service}
                    <span class="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {service}
                    </span>
                  {/each}
                </div>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-500">Equipment & Costumes</h3>
                <div class="mt-1">
                  {#if event.costume}
                    <div class="flex items-start">
                      <Icon name="shirt" size={16} class="text-gray-400 mr-2 mt-1" />
                      <p>Costume: {event.costume}</p>
                    </div>
                  {/if}
                  
                  {#if event.equipmentNeeded && event.equipmentNeeded.length > 0}
                    <div class="flex items-start mt-2">
                      <Icon name="package" size={16} class="text-gray-400 mr-2 mt-1" />
                      <div>
                        <p class="font-medium">Equipment Needed:</p>
                        <ul class="list-disc pl-5 mt-1 space-y-1">
                          {#each event.equipmentNeeded as item}
                            <li>{item}</li>
                          {/each}
                        </ul>
                      </div>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Client & Management Summary -->
          <div class="space-y-6">
            <div class="bg-white rounded-lg shadow p-4">
              <h2 class="text-lg font-semibold mb-4">Management Summary</h2>
              
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">Client Liaison:</span>
                  <span class="font-medium">{event.clientLiaison}</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-600">Gig Manager:</span>
                  <span class="font-medium">{event.gigManager}</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-600">Created:</span>
                  <span>{format(event.createdAt, 'MMM d, yyyy')}</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-600">Last Updated:</span>
                  <span>{format(event.updatedAt, 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
            
            <div class="bg-white rounded-lg shadow p-4">
              <h2 class="text-lg font-semibold mb-4">Financial Summary</h2>
              
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">Event Value:</span>
                  <span class="font-medium">${event.payment.totalValue.toFixed(2)}</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-600">Performer Pay:</span>
                  <span class="font-medium">${totalPay.toFixed(2)}</span>
                </div>
                
                <div class="flex justify-between border-t pt-2 mt-2">
                  <span class="text-gray-700 font-medium">Profit:</span>
                  <span class="font-bold text-green-700">${profit.toFixed(2)}</span>
                </div>
                
                {#if event.deposit.required}
                  <div class="mt-4 pt-3 border-t">
                    <div class="flex justify-between">
                      <span class="text-gray-600">Deposit Required:</span>
                      <span class="font-medium">${event.deposit.amount?.toFixed(2) || 'N/A'}</span>
                    </div>
                    
                    <div class="flex justify-between mt-1">
                      <span class="text-gray-600">Deposit Status:</span>
                      <span class={event.deposit.received ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                        {event.deposit.received ? 'Received' : 'Pending'}
                      </span>
                    </div>
                    
                    {#if event.deposit.received && event.deposit.receivedDate}
                      <div class="flex justify-between mt-1">
                        <span class="text-gray-600">Date Received:</span>
                        <span>{format(event.deposit.receivedDate, 'MMM d, yyyy')}</span>
                      </div>
                    {/if}
                  </div>
                {/if}
                
                <div class="mt-4 pt-3 border-t">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Payment Status:</span>
                    <span class={event.payment.paid ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                      {event.payment.paid ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                  
                  {#if event.payment.paid && event.payment.paidDate}
                    <div class="flex justify-between mt-1">
                      <span class="text-gray-600">Date Paid:</span>
                      <span>{format(event.payment.paidDate, 'MMM d, yyyy')}</span>
                    </div>
                  {/if}
                  
                  {#if event.payment.paid && event.payment.method}
                    <div class="flex justify-between mt-1">
                      <span class="text-gray-600">Payment Method:</span>
                      <span>{event.payment.method}</span>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
      
      <!-- Performers Tab -->
      {#if activeTab === 'performers'}
        <div>
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">Performers ({eventPerformers.length})</h2>
            
            {#if canEdit}
              <Button href="/events/{event.id}/add-performer">
                <Icon name="plus" size={16} class="mr-1" />
                Add Performer
              </Button>
            {/if}
          </div>
          
          {#if eventPerformers.length === 0}
            <div class="bg-white rounded-lg shadow p-8 text-center">
              <p class="text-gray-500">No performers assigned to this event yet.</p>
              
              {#if canEdit}
                <Button href="/events/{event.id}/add-performer" class="mt-4">
                  Add Performer
                </Button>
              {/if}
            </div>
          {:else}
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {#each eventPerformers as performer}
                <div class="bg-white rounded-lg shadow overflow-hidden">
                  <div class="p-4">
                    <div class="flex justify-between items-start">
                      <div>
                        <h3 class="font-medium">{performer.name}</h3>
                        <p class="text-sm text-gray-600">{performer.role}</p>
                      </div>
                      
                      <span class="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        ${performer.pay}
                      </span>
                    </div>
                    
                    <div class="mt-3 text-sm">
                      <div class="flex items-center">
                        <Icon name="mail" size={14} class="text-gray-400 mr-2" />
                        <a href="mailto:{performer.email}" class="text-blue-600 hover:underline">
                          {performer.email}
                        </a>
                      </div>
                      
                      <div class="flex items-center mt-1">
                        <Icon name="phone" size={14} class="text-gray-400 mr-2" />
                        <a href="tel:{performer.phone}" class="text-blue-600 hover:underline">
                          {performer.phone}
                        </a>
                      </div>
                    </div>
                    
                    {#if performer.skills && performer.skills.length > 0}
                      <div class="mt-3">
                        <h4 class="text-xs text-gray-500 font-medium mb-1">Skills</h4>
                        <div class="flex flex-wrap gap-1">
                          {#each performer.skills as skill}
                            <span class="inline-block px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                              {skill.category}
                            </span>
                          {/each}
                        </div>
                      </div>
                    {/if}
                  </div>
                  
                  {#if canEdit}
                    <div class="bg-gray-50 px-4 py-3 border-t flex justify-between">
                      <button class="text-sm text-blue-600 hover:underline">
                        View Profile
                      </button>
                      <button class="text-sm text-red-600 hover:underline">
                        Remove
                      </button>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
      
      <!-- Client Info Tab -->
      {#if activeTab === 'client' && client}
        <div class="bg-white rounded-lg shadow p-4">
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-lg font-semibold">Client Information</h2>
            
            {#if canEdit}
              <Button href="/clients/{client.id}" variant="outline">
                <Icon name="external-link" size={16} class="mr-1" />
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
                      <Icon name="mail" size={14} class="text-gray-400 mr-2" />
                      <a href="mailto:{client.email}" class="text-blue-600 hover:underline">
                        {client.email}
                      </a>
                    </div>
                    
                    <div class="flex items-center">
                      <Icon name="phone" size={14} class="text-gray-400 mr-2" />
                      <a href="tel:{client.phone}" class="text-blue-600 hover:underline">
                        {client.phone}
                      </a>
                    </div>
                    
                    <div class="flex items-start">
                      <Icon name="map-pin" size={14} class="text-gray-400 mr-2 mt-1" />
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
                      <span class="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
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
                      <span class="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
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
                      <Icon name="bell" size={16} class="text-amber-600 mr-2 mt-1" />
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
      {/if}
      
      <!-- Contract & Payment Tab -->
      {#if activeTab === 'contract'}
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Contract Information -->
          <div class="bg-white rounded-lg shadow p-4">
            <div class="flex justify-between items-start mb-4">
              <h2 class="text-lg font-semibold">Contract Status</h2>
              
              {#if canEdit}
                <Button href="/events/{event.id}/contract" variant="outline">
                  <Icon name="file-text" size={16} class="mr-1" />
                  {event.contract.url ? 'View Contract' : 'Generate Contract'}
                </Button>
              {/if}
            </div>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Contract Sent:</span>
                <span class={event.contract.sent ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                  {event.contract.sent ? 'Yes' : 'No'}
                </span>
              </div>
              
              {#if event.contract.sent && event.contract.sentDate}
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">Date Sent:</span>
                  <span>{format(event.contract.sentDate, 'MMM d, yyyy')}</span>
                </div>
              {/if}
              
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Contract Received:</span>
                <span class={event.contract.received ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                  {event.contract.received ? 'Yes' : 'No'}
                </span>
              </div>
              
              {#if event.contract.received && event.contract.receivedDate}
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">Date Received:</span>
                  <span>{format(event.contract.receivedDate, 'MMM d, yyyy')}</span>
                </div>
              {/if}
              
              {#if event.contract.url}
                <div class="mt-4 pt-4 border-t">
                  <a
                    href={event.contract.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                  >
                    <Icon name="file-text" size={16} class="mr-2" />
                    View Contract
                  </a>
                </div>
              {/if}
              
              {#if canEdit}
                <div class="mt-4 pt-4 border-t space-y-2">
                  <h3 class="text-sm font-medium text-gray-700">Contract Actions</h3>
                  
                  {#if !event.contract.sent}
                    <button class="inline-flex w-full items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                      <Icon name="send" size={16} class="mr-2" />
                      Mark Contract as Sent
                    </button>
                  {/if}
                  
                  {#if event.contract.sent && !event.contract.received}
                    <button class="inline-flex w-full items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                      <Icon name="check" size={16} class="mr-2" />
                      Mark Contract as Received
                    </button>
                  {/if}
                  
                  {#if !event.contract.url}
                    <button class="inline-flex w-full items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      <Icon name="upload" size={16} class="mr-2" />
                      Upload Contract
                    </button>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
          
          <!-- Payment Information -->
          <div class="bg-white rounded-lg shadow p-4">
            <div class="flex justify-between items-start mb-4">
              <h2 class="text-lg font-semibold">Payment Details</h2>
              
              {#if canEdit}
                <Button href="/events/{event.id}/invoice" variant="outline">
                  <Icon name="dollar-sign" size={16} class="mr-1" />
                  {event.payment.paid ? 'View Invoice' : 'Generate Invoice'}
                </Button>
              {/if}
            </div>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Total Event Value:</span>
                <span class="font-medium">${event.payment.totalValue.toFixed(2)}</span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Payment Status:</span>
                <span class={event.payment.paid ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                  {event.payment.paid ? 'Paid' : 'Unpaid'}
                </span>
              </div>
              
              {#if event.payment.paid && event.payment.paidDate}
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">Date Paid:</span>
                  <span>{format(event.payment.paidDate, 'MMM d, yyyy')}</span>
                </div>
              {/if}
              
              {#if event.payment.paid && event.payment.method}
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">Payment Method:</span>
                  <span class="capitalize">{event.payment.method}</span>
                </div>
              {/if}
              
              {#if event.deposit.required}
                <div class="mt-4 pt-4 border-t">
                  <h3 class="text-sm font-medium text-gray-700 mb-3">Deposit Information</h3>
                  
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600">Deposit Amount:</span>
                    <span class="font-medium">${event.deposit.amount?.toFixed(2) || 'N/A'}</span>
                  </div>
                  
                  <div class="flex items-center justify-between mt-2">
                    <span class="text-gray-600">Deposit Status:</span>
                    <span class={event.deposit.received ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                      {event.deposit.received ? 'Received' : 'Pending'}
                    </span>
                  </div>
                  
                  {#if event.deposit.received && event.deposit.receivedDate}
                    <div class="flex items-center justify-between mt-2">
                      <span class="text-gray-600">Date Received:</span>
                      <span>{format(event.deposit.receivedDate, 'MMM d, yyyy')}</span>
                    </div>
                  {/if}
                </div>
              {/if}
              
              {#if canEdit}
                <div class="mt-4 pt-4 border-t space-y-2">
                  <h3 class="text-sm font-medium text-gray-700">Payment Actions</h3>
                  
                  {#if !event.payment.paid}
                    <button class="inline-flex w-full items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                      <Icon name="check-circle" size={16} class="mr-2" />
                      Mark as Paid
                    </button>
                    
                    <button class="inline-flex w-full items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      <Icon name="mail" size={16} class="mr-2" />
                      Send Payment Reminder
                    </button>
                  {/if}
                  
                  {#if event.deposit.required && !event.deposit.received}
                    <button class="inline-flex w-full items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                      <Icon name="check-circle" size={16} class="mr-2" />
                      Mark Deposit as Received
                    </button>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/if}
      
      <!-- Notes Tab -->
      {#if activeTab === 'notes'}
        <div class="bg-white rounded-lg shadow p-4">
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-lg font-semibold">Event Notes</h2>
            
            {#if canEdit}
              <Button variant="outline" on:click={() => showEditNotesModal = true}>
                <Icon name="edit" size={16} class="mr-1" />
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
                <Button class="mt-4" on:click={() => showEditNotesModal = true}>
                  Add Notes
                </Button>
              {/if}
            </div>
          {/if}
        </div>
      {/if}
    </div>
    
    <!-- Modals -->
    {#if showEditModal}
      <Modal
        title="Edit Event"
        onClose={() => showEditModal = false}
        size="lg"
      >
        <EventForm
          event={event}
          onSubmit={async (updatedEvent) => {
            await eventStore.updateEvent(event.id, updatedEvent);
            showEditModal = false;
          }}
          onCancel={() => showEditModal = false}
        />
      </Modal>
    {/if}
    
    {#if showDeleteConfirm}
      <ConfirmDialog
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete Event"
        confirmColor="red"
        onConfirm={handleDelete}
        onCancel={() => showDeleteConfirm = false}
        isLoading={isDeleting}
      />
    {/if}
  {/if}