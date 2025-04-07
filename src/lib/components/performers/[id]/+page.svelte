<!-- src/routes/performers/[id]/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { format } from 'date-fns';
    import { performerStore } from '$lib/stores/performerStore';
    import { eventStore } from '$lib/stores/eventStore';
    import { checkUserRole } from '$lib/services/auth';
    import Icon from '$lib/components/ui/Icon.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Badge from '$lib/components/ui/Badge.svelte';
    import Tab from '$lib/components/ui/Tab.svelte';
    import Modal from '$lib/components/ui/Modal.svelte';
    import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
    import PerformerForm from '$lib/components/performers/PerformerForm.svelte';
    import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
    
    // State variables
    let loading = true;
    let activeTab = 'details';
    let showEditModal = false;
    let showDeleteConfirm = false;
    let isDeleting = false;
    let performerEvents = [];
    
    // User permissions
    let canEditPerformer: boolean;
    
    const performerId = $page.params.id;
    
    onMount(async () => {
      try {
        // Check user permissions
        const checkRole = checkUserRole('manager');
        canEditPerformer = $checkRole;
        
        // Load performer data
        await performerStore.loadPerformer(performerId);
        
        // Load performer's events
        await eventStore.loadPerformerEvents(performerId);
        performerEvents = $eventStore.events;
      } catch (error) {
        console.error('Error loading performer data:', error);
      } finally {
        loading = false;
      }
    });
    
    // Reactive variable based on store data
    $: performer = $performerStore.selectedPerformer;
    
    // Calculate performer metrics
    $: upcomingEvents = performerEvents.filter(e => 
      new Date(e.date) >= new Date() && 
      e.status !== 'cancelled'
    ).length;
    
    $: pastEvents = performerEvents.filter(e => 
      new Date(e.date) < new Date() || 
      e.status === 'completed'
    ).length;
    
    $: totalEarnings = performerEvents
      .filter(e => e.status !== 'cancelled')
      .reduce((sum, e) => {
        const performerAssignment = e.performers.find(p => p.performer === performerId);
        return sum + (performerAssignment ? performerAssignment.pay : 0);
      }, 0);
    
    // Get color for skill category badge
    function getColorForSkill(category: string): string {
      switch(category) {
        case 'fire':
          return 'red';
        case 'balloon':
          return 'purple';
        case 'stilt':
          return 'green';
        case 'juggle':
          return 'blue';
        case 'aerial':
          return 'amber';
        case 'magic':
          return 'blue';
        default:
          return 'gray';
      }
    }
    
    // Get color for skill level badge
    function getColorForLevel(level: string): string {
      switch(level) {
        case 'beginner':
          return 'blue';
        case 'intermediate':
          return 'amber';
        case 'expert':
          return 'green';
        default:
          return 'gray';
      }
    }
    
    // Format skill category for display
    function formatSkillCategory(category: string): string {
      switch(category) {
        case 'fire':
          return 'Fire Performance';
        case 'balloon':
          return 'Balloon Art';
        case 'stilt':
          return 'Stilt Walking';
        case 'juggle':
          return 'Juggling';
        case 'aerial':
          return 'Aerial Arts';
        case 'magic':
          return 'Magic';
        default:
          return 'Other';
      }
    }
    
    // Format pay rate unit for display
    function formatPayRateUnit(unit: string): string {
      switch(unit) {
        case 'hourly':
          return 'Per Hour';
        case 'per-event':
          return 'Per Event';
        case 'per-day':
          return 'Per Day';
        default:
          return unit;
      }
    }
    
    // Handle performer update
    async function handleUpdatePerformer(performerData) {
      try {
        await performerStore.updatePerformer(performerId, performerData);
        showEditModal = false;
      } catch (error) {
        console.error('Error updating performer:', error);
      }
    }
    
    // Handle performer delete
    async function handleDeletePerformer() {
      isDeleting = true;
      
      try {
        await performerStore.deletePerformer(performerId);
        // Navigate to performers page
        window.location.href = '/performers';
      } catch (error) {
        console.error('Error deleting performer:', error);
        isDeleting = false;
        showDeleteConfirm = false;
      }
    }
    
    // Get event status badge color
    function getEventStatusColor(status: string): string {
      switch (status) {
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
    
    // Format event status for display
    function formatEventStatus(status: string): string {
      switch (status) {
        case 'deposit-received':
          return 'Deposit Received';
        default:
          return status.charAt(0).toUpperCase() + status.slice(1);
      }
    }
    
    // Update availability
    async function updateAvailability(date: Date, status: 'available' | 'unavailable' | 'tentative', notes?: string) {
      try {
        await performerStore.updateAvailability(performerId, date, status, notes);
      } catch (error) {
        console.error('Error updating availability:', error);
      }
    }
  </script>
  
  <svelte:head>
    <title>{performer?.name || 'Performer Details'} | CircusSync</title>
  </svelte:head>
  
  {#if loading}
    <div class="flex justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>
  {:else if !performer}
    <div class="p-6 text-center">
      <h1 class="text-2xl font-bold text-red-600 mb-2">Performer Not Found</h1>
      <p class="text-gray-600 mb-4">The performer you're looking for doesn't exist or you don't have permission to view it.</p>
      <Button href="/performers">Back to Performers</Button>
    </div>
  {:else}
    <!-- Performer Header -->
    <div class="bg-white border-b">
      <div class="max-w-7xl mx-auto p-4 md:p-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <!-- Performer Name and Primary Skill -->
          <div class="flex items-center">
            {#if performer.profilePhoto}
              <img
                src={performer.profilePhoto}
                alt={performer.name}
                class="h-16 w-16 rounded-full object-cover mr-4"
              />
            {:else}
              <div class="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <span class="text-xl font-medium text-blue-700">
                  {performer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
            {/if}
            
            <div>
              <h1 class="text-2xl font-bold">{performer.name}</h1>
              
              {#if performer.skills && performer.skills.length > 0}
                <div class="flex flex-wrap gap-1 mt-1">
                  {#each performer.skills.slice(0, 2) as skill}
                    <Badge color={getColorForSkill(skill.category)}>
                      {formatSkillCategory(skill.category)}
                    </Badge>
                  {/each}
                  
                  {#if performer.skills.length > 2}
                    <span class="text-sm text-gray-500">+{performer.skills.length - 2} more</span>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
          
          <!-- Action Buttons -->
          {#if canEditPerformer}
            <div class="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                on:click={() => showEditModal = true}
              >
                <Icon name="edit" size={16} class="mr-1" />
                Edit Profile
              </Button>
              
              <Button 
                variant="outline" 
                color="red"
                on:click={() => showDeleteConfirm = true}
              >
                <Icon name="trash-2" size={16} class="mr-1" />
                Delete
              </Button>
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
            label="Skills" 
            active={activeTab === 'skills'} 
            on:click={() => activeTab = 'skills'} 
            badge={performer.skills ? performer.skills.length.toString() : '0'}
          />
          <Tab 
            label="Events" 
            active={activeTab === 'events'} 
            on:click={() => activeTab = 'events'} 
            badge={performerEvents.length.toString()}
          />
          <Tab 
            label="Availability" 
            active={activeTab === 'availability'} 
            on:click={() => activeTab = 'availability'} 
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
          <!-- Performer Details -->
          <div class="bg-white rounded-lg shadow p-4">
            <h2 class="text-lg font-semibold mb-4">Contact Information</h2>
            
            <div class="space-y-4">
              {#if performer.email}
                <div class="flex items-center">
                  <Icon name="mail" size={16} class="text-gray-400 mr-2" />
                  <a href="mailto:{performer.email}" class="text-blue-600 hover:underline">
                    {performer.email}
                  </a>
                </div>
              {/if}
              
              {#if performer.phone}
                <div class="flex items-center">
                  <Icon name="phone" size={16} class="text-gray-400 mr-2" />
                  <a href="tel:{performer.phone}" class="text-blue-600 hover:underline">
                    {performer.phone}
                  </a>
                </div>
              {/if}
              
              {#if performer.address}
                <div class="flex items-start">
                  <Icon name="map-pin" size={16} class="text-gray-400 mr-2 mt-1" />
                  <p class="flex-1">{performer.address}</p>
                </div>
              {/if}
            </div>
            
            {#if performer.payRate && performer.payRate.length > 0}
              <div class="mt-6">
                <h2 class="text-lg font-semibold mb-4">Pay Rates</h2>
                
                <div class="bg-gray-50 rounded-md overflow-hidden">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-100">
                      <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rate
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      {#each performer.payRate as rate}
                        <tr>
                          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {rate.category}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${rate.rate.toFixed(2)}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatPayRateUnit(rate.unit)}
                          </td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>
              </div>
            {/if}
          </div>
          
          <!-- Performance Metrics -->
          <div class="space-y-6">
            <div class="bg-white rounded-lg shadow p-4">
              <h2 class="text-lg font-semibold mb-4">Performance Summary</h2>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <p class="text-sm font-medium text-blue-800 mb-1">Upcoming Events</p>
                  <p class="text-xl font-bold text-blue-700">{upcomingEvents}</p>
                </div>
                
                <div class="bg-purple-50 p-3 rounded-lg border border-purple-100">
                  <p class="text-sm font-medium text-purple-800 mb-1">Past Events</p>
                  <p class="text-xl font-bold text-purple-700">{pastEvents}</p>
                </div>
                
                <div class="col-span-2 bg-green-50 p-3 rounded-lg border border-green-100">
                  <p class="text-sm font-medium text-green-800 mb-1">Total Earnings</p>
                  <p class="text-xl font-bold text-green-700">${totalEarnings.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            <div class="bg-white rounded-lg shadow p-4">
              <h2 class="text-lg font-semibold mb-4">Quick Actions</h2>
              
              <div class="space-y-2">
                <Button 
                  href="/events/new?performer={performer.id}" 
                  fullWidth={true}
                >
                  <Icon name="calendar" size={16} class="mr-1" />
                  Add to New Event
                </Button>
                
                <Button 
                  variant="outline" 
                  fullWidth={true}
                  href={`mailto:${performer.email}`}
                >
                  <Icon name="mail" size={16} class="mr-1" />
                  Send Email
                </Button>
                
                <Button 
                  variant="outline" 
                  color="blue" 
                  fullWidth={true}
                  href="/performers/{performer.id}/schedule"
                >
                  <Icon name="calendar" size={16} class="mr-1" />
                  Manage Schedule
                </Button>
              </div>
            </div>
          </div>
        </div>
      {/if}
      
      <!-- Skills Tab -->
      {#if activeTab === 'skills'}
        <div>
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">Skills & Specialties</h2>
            
            {#if canEditPerformer}
              <Button 
                variant="outline" 
                on:click={() => showEditModal = true}
              >
                <Icon name="plus" size={16} class="mr-1" />
                Add Skill
              </Button>
            {/if}
          </div>
          
          {#if !performer.skills || performer.skills.length === 0}
            <div class="bg-white rounded-lg shadow p-8 text-center">
              <p class="text-gray-500">No skills have been added yet.</p>
              
              {#if canEditPerformer}
                <Button on:click={() => showEditModal = true} class="mt-4">
                  Add First Skill
                </Button>
              {/if}
            </div>
          {:else}
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {#each performer.skills as skill}
                <div class="bg-white rounded-lg shadow overflow-hidden">
                  <div class="px-4 py-5 sm:p-6">
                    <div class="flex justify-between items-start">
                      <h3 class="text-lg font-medium text-gray-900">
                        {formatSkillCategory(skill.category)}
                      </h3>
                      
                      <Badge color={getColorForLevel(skill.level)}>
                        {skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}
                      </Badge>
                    </div>
                    
                    {#if skill.props && skill.props.length > 0}
                      <div class="mt-4">
                        <h4 class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Props</h4>
                        <div class="flex flex-wrap gap-1">
                          {#each skill.props as prop}
                            <span class="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                              {prop}
                            </span>
                          {/each}
                        </div>
                      </div>
                    {/if}
                    
                    {#if skill.acts && skill.acts.length > 0}
                      <div class="mt-4">
                        <h4 class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Signature Acts</h4>
                        <div class="flex flex-wrap gap-1">
                          {#each skill.acts as act}
                            <span class="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              {act}
                            </span>
                          {/each}
                        </div>
                      </div>
                    {/if}
                  </div>
                  
                  {#if canEditPerformer}
                    <div class="px-4 py-3 bg-gray-50 border-t text-right">
                      <button 
                        class="text-sm font-medium text-blue-600 hover:text-blue-500"
                        on:click={() => {/* Open edit skill modal */}}
                      >
                        Edit
                      </button>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
      
      <!-- Events Tab -->
      {#if activeTab === 'events'}
        <div>
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">Events ({performerEvents.length})</h2>
            
            {#if canEditPerformer}
              <Button href="/events/new?performer={performer.id}">
                <Icon name="plus" size={16} class="mr-1" />
                Add to Event
              </Button>
            {/if}
          </div>
          
          {#if performerEvents.length === 0}
            <div class="bg-white rounded-lg shadow p-8 text-center">
              <p class="text-gray-500">No events found for this performer.</p>
              
              {#if canEditPerformer}
                <Button href="/events/new?performer={performer.id}" class="mt-4">
                  Add to Event
                </Button>
              {/if}
            </div>
          {:else}
            <div class="bg-white shadow overflow-hidden sm:rounded-md">
              <ul class="divide-y divide-gray-200">
                {#each performerEvents as event (event.id)}
                  <li>
                    <a href="/events/{event.id}" class="block hover:bg-gray-50">
                      <div class="px-4 py-4 sm:px-6">
                        <div class="flex items-center justify-between">
                          <div>
                            <p class="text-lg font-medium text-blue-600 truncate">{event.name}</p>
                            <p class="text-sm text-gray-500">{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</p>
                          </div>
                          <div class="ml-2 flex-shrink-0 flex">
                            <Badge color={getEventStatusColor(event.status)}>
                              {formatEventStatus(event.status)}
                            </Badge>
                          </div>
                        </div>
                        <div class="mt-2 sm:flex sm:justify-between">
                          <div class="sm:flex">
                            <div class="flex items-center text-sm text-gray-500">
                              <Icon name="clock" size={16} class="flex-shrink-0 mr-1.5 text-gray-400" />
                              {event.performanceTime.start} - {event.performanceTime.end}
                            </div>
                            <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              <Icon name="map-pin" size={16} class="flex-shrink-0 mr-1.5 text-gray-400" />
                              {event.location.address.split(',')[0]}
                            </div>
                          </div>
                          
                          {#if event.performers.find(p => p.performer === performerId)}
                            {@const performerAssignment = event.performers.find(p => p.performer === performerId)}
                            <div class="mt-2 flex items-center text-sm font-medium text-green-700 sm:mt-0">
                              <Icon name="dollar-sign" size={16} class="flex-shrink-0 mr-1.5 text-green-600" />
                              ${performerAssignment.pay.toFixed(2)}
                            </div>
                          {/if}
                        </div>
                      </div>
                    </a>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>
      {/if}
      
      <!-- Availability Tab -->
      {#if activeTab === 'availability'}
        <div class="bg-white rounded-lg shadow p-4">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">Availability Calendar</h2>
            
            {#if canEditPerformer}
              <Button 
                variant="outline" 
                on:click={() => {/* Open add availability modal */}}
              >
                <Icon name="plus" size={16} class="mr-1" />
                Set Availability
              </Button>
            {/if}
          </div>
          
          <!-- Placeholder for availability calendar -->
          <div class="p-8 text-center text-gray-500 border border-dashed rounded-md">
            <p>Availability calendar will be implemented here.</p>
            <p class="text-sm mt-2">Coming soon!</p>
          </div>
          
          {#if performer.availability && performer.availability.length > 0}
            <div class="mt-6">
              <h3 class="text-md font-medium mb-3">Availability Records</h3>
              
              <div class="bg-gray-50 rounded-md overflow-hidden">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-100">
                    <tr>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      {#if canEditPerformer}
                        <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      {/if}
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    {#each performer.availability as avail}
                      <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {format(new Date(avail.date), 'MMMM d, yyyy')}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                          {#if avail.status === 'available'}
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Available
                            </span>
                          {:else if avail.status === 'unavailable'}
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Unavailable
                            </span>
                          {:else}
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              Tentative
                            </span>
                          {/if}
                        </td>
                        <td class="px-6 py-4 text-sm text-gray-500">
                          {avail.notes || '-'}
                        </td>
                        {#if canEditPerformer}
                          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <a href="#" class="text-blue-600 hover:text-blue-900 mr-4">Edit</a>
                            <a href="#" class="text-red-600 hover:text-red-900">Remove</a>
                          </td>
                        {/if}
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          {/if}
        </div>
      {/if}
      
      <!-- Notes Tab -->
      {#if activeTab === 'notes'}
        <div class="bg-white rounded-lg shadow p-4">
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-lg font-semibold">Performer Notes</h2>
            
            {#if canEditPerformer}
              <Button variant="outline" on:click={() => {/* Open edit notes modal */}}>
                <Icon name="edit" size={16} class="mr-1" />
                Edit Notes
              </Button>
            {/if}
          </div>
          
          {#if performer.notes}
            <div class="whitespace-pre-line p-4 bg-gray-50 rounded-md min-h-[200px]">
              {performer.notes}
            </div>
          {:else}
            <div class="p-8 text-center text-gray-500 bg-gray-50 rounded-md min-h-[200px]">
              <p>No notes have been added for this performer.</p>
              
              {#if canEditPerformer}
                <Button class="mt-4" on:click={() => {/* Open edit notes modal */}}>
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
        title="Edit Performer"
        size="lg"
        on:close={() => showEditModal = false}
      >
        <PerformerForm
          performer={performer}
          submitLabel="Update Performer"
          on:submit={handleUpdatePerformer}
          on:cancel={() => showEditModal = false}
        />
      </Modal>
    {/if}
    
    {#if showDeleteConfirm}
      <ConfirmDialog
        title="Delete Performer"
        message="Are you sure you want to delete this performer? This action cannot be undone and will remove all performer data."
        confirmText="Delete Performer"
        confirmColor="red"
        on:confirm={handleDeletePerformer}
        on:cancel={() => showDeleteConfirm = false}
        isLoading={isDeleting}
      />
    {/if}
  {/if}