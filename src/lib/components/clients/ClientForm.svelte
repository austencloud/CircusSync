<!-- src/lib/components/clients/ClientForm.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import type { Client } from '$lib/types';
    import Icon from '$lib/components/ui/Icon.svelte';
    
    export let client: Partial<Client> = {};
    export let submitLabel = 'Save Client';
    export let isLoading = false;
    export let showCancelButton = true;
    
    const dispatch = createEventDispatcher();
    
    // Form state
    let formData = {
      name: client.name || '',
      contactPerson: client.contactPerson || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      eventTypes: client.eventTypes || [],
      servicesUsed: client.servicesUsed || [],
      status: client.status || 'lead',
      notes: client.notes || ''
    };
    
    // New fields for event types and services
    let newEventType = '';
    let newService = '';
    
    // Options for event types and services
    const eventTypeOptions = [
      'Corporate Event',
      'Festival',
      'Wedding',
      'Birthday Party',
      'Holiday Event',
      'School Event',
      'Convention',
      'Trade Show',
      'Religious Event',
      'Non-profit Fundraiser'
    ];
    
    const serviceOptions = [
      'Fire Performance',
      'Juggling',
      'Stilt Walking',
      'Aerial Performance',
      'Balloon Art',
      'Magic',
      'LED Performance',
      'Ambient Entertainment',
      'Choreographed Show',
      'Interactive Workshop'
    ];
    
    // Handle form submission
    function handleSubmit() {
      // Validate form fields
      if (!formData.name) {
        alert('Client name is required');
        return;
      }
      
      dispatch('submit', formData);
    }
    
    // Handle cancel button
    function handleCancel() {
      dispatch('cancel');
    }
    
    // Add new event type
    function addEventType() {
      if (newEventType && !formData.eventTypes.includes(newEventType)) {
        formData.eventTypes = [...formData.eventTypes, newEventType];
        newEventType = '';
      }
    }
    
    // Remove event type
    function removeEventType(eventType: string) {
      formData.eventTypes = formData.eventTypes.filter((t: string) => t !== eventType);
    }
    
    // Add new service
    function addService() {
      if (newService && !formData.servicesUsed.includes(newService)) {
        formData.servicesUsed = [...formData.servicesUsed, newService];
        newService = '';
      }
    }
    
    // Remove service
    function removeService(service: string) {
      formData.servicesUsed = formData.servicesUsed.filter((s: string) => s !== service);
    }
    
    // Toggle event type from predefined options
    function toggleEventType(eventType: string) {
      if (formData.eventTypes.includes(eventType)) {
        removeEventType(eventType);
      } else {
        formData.eventTypes = [...formData.eventTypes, eventType];
      }
    }
    
    // Toggle service from predefined options
    function toggleService(service: string) {
      if (formData.servicesUsed.includes(service)) {
        removeService(service);
      } else {
        formData.servicesUsed = [...formData.servicesUsed, service];
      }
    }
  </script>
  
  <form on:submit|preventDefault={handleSubmit} class="space-y-6">
    <!-- Basic Information Section -->
    <div>
      <h3 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Client Name -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
            Client Name *
          </label>
          <input
            type="text"
            id="name"
            bind:value={formData.name}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <!-- Contact Person -->
        <div>
          <label for="contactPerson" class="block text-sm font-medium text-gray-700 mb-1">
            Contact Person
          </label>
          <input
            type="text"
            id="contactPerson"
            bind:value={formData.contactPerson}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            bind:value={formData.email}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <!-- Phone -->
        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            bind:value={formData.phone}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <!-- Address -->
        <div class="md:col-span-2">
          <label for="address" class="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            id="address"
            bind:value={formData.address}
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          ></textarea>
        </div>
      </div>
    </div>
    
    <!-- Client Status -->
    <div>
      <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
        Client Status
      </label>
      <select
        id="status"
        bind:value={formData.status}
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="lead">Lead</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="yearly">Yearly</option>
      </select>
    </div>
    
    <!-- Event Types Section -->
    <div>
      <h3 class="text-lg font-medium text-gray-900 mb-4">Event Types</h3>
      
      <!-- Selected Event Types -->
      <div class="flex flex-wrap gap-2 mb-3">
        {#each formData.eventTypes as eventType}
          <div class="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm">
            {eventType}
            <button
              type="button"
              class="ml-1 text-blue-600 hover:text-blue-800"
              on:click={() => removeEventType(eventType)}
            >
              <Icon name="x" size={16} />
            </button>
          </div>
        {/each}
        
        {#if formData.eventTypes.length === 0}
          <p class="text-gray-500 text-sm italic">No event types selected</p>
        {/if}
      </div>
      
      <!-- Common Event Types -->
      <div class="mb-3">
        <p class="text-sm font-medium text-gray-700 mb-2">Common Event Types:</p>
        <div class="flex flex-wrap gap-2">
          {#each eventTypeOptions as option}
            <button
              type="button"
              class="px-3 py-1 text-sm rounded-full {formData.eventTypes.includes(option) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}"
              on:click={() => toggleEventType(option)}
            >
              {option}
            </button>
          {/each}
        </div>
      </div>
      
      <!-- Add Custom Event Type -->
      <div class="flex">
        <input
          type="text"
          placeholder="Add custom event type"
          bind:value={newEventType}
          class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="button"
          class="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          on:click={addEventType}
        >
          Add
        </button>
      </div>
    </div>
    
    <!-- Services Used Section -->
    <div>
      <h3 class="text-lg font-medium text-gray-900 mb-4">Services Used</h3>
      
      <!-- Selected Services -->
      <div class="flex flex-wrap gap-2 mb-3">
        {#each formData.servicesUsed as service}
          <div class="inline-flex items-center bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm">
            {service}
            <button
              type="button"
              class="ml-1 text-green-600 hover:text-green-800"
              on:click={() => removeService(service)}
            >
              <Icon name="x" size={16} />
            </button>
          </div>
        {/each}
        
        {#if formData.servicesUsed.length === 0}
          <p class="text-gray-500 text-sm italic">No services selected</p>
        {/if}
      </div>
      
      <!-- Common Services -->
      <div class="mb-3">
        <p class="text-sm font-medium text-gray-700 mb-2">Available Services:</p>
        <div class="flex flex-wrap gap-2">
          {#each serviceOptions as option}
            <button
              type="button"
              class="px-3 py-1 text-sm rounded-full {formData.servicesUsed.includes(option) ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}"
              on:click={() => toggleService(option)}
            >
              {option}
            </button>
          {/each}
        </div>
      </div>
      
      <!-- Add Custom Service -->
      <div class="flex">
        <input
          type="text"
          placeholder="Add custom service"
          bind:value={newService}
          class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="button"
          class="px-3 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          on:click={addService}
        >
          Add
        </button>
      </div>
    </div>
    
    <!-- Notes Section -->
    <div>
      <h3 class="text-lg font-medium text-gray-900 mb-4">Notes</h3>
      <textarea
        bind:value={formData.notes}
        rows="4"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Add any notes about this client..."
      ></textarea>
    </div>
    
    <!-- Form Actions -->
    <div class="flex justify-end space-x-3 pt-4 border-t">
      {#if showCancelButton}
        <Button 
          type="button" 
          variant="outline" 
          color="gray" 
          on:click={handleCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      {/if}
      
      <Button 
        type="submit" 
        loading={isLoading}
        disabled={isLoading}
      >
        {submitLabel}
      </Button>
    </div>
  </form>