<script lang="ts">
    import Icon from '$lib/components/ui/Icon.svelte';
    
    export let formData: any;
    export let serviceOptions: string[] = [];
    
    let newService = '';
    
    // Add service
    function addService() {
      if (!newService) return;
  
      if (!formData.services.includes(newService)) {
        formData.services = [...formData.services, newService];
        newService = '';
      }
    }
  
    // Remove service
    function removeService(service: string) {
      formData.services = formData.services.filter((s: string) => s !== service);
    }
  
    // Toggle service from predefined list
    function toggleService(service: string) {
      if (formData.services.includes(service)) {
        formData.services = formData.services.filter((s: string) => s !== service);
      } else {
        formData.services = [...formData.services, service];
      }
    }
  </script>
  
  <div class="mt-6">
    <h4 class="text-sm font-medium text-gray-700 mb-3">Services</h4>
  
    <!-- Selected Services -->
    <div class="flex flex-wrap gap-2 mb-3">
      {#each formData.services as service}
        <div class="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm">
          {service}
          <button
            type="button"
            class="ml-1 text-blue-600 hover:text-blue-800"
            on:click={() => removeService(service)}
          >
            <Icon name="x" size={16} />
          </button>
        </div>
      {/each}
  
      {#if formData.services.length === 0}
        <p class="text-gray-500 text-sm italic">No services selected</p>
      {/if}
    </div>
  
    <!-- Common Services -->
    <div class="mb-3">
      <p class="text-sm font-medium text-gray-700 mb-2">Common Services:</p>
      <div class="flex flex-wrap gap-2">
        {#each serviceOptions as option}
          <button
            type="button"
            class="px-3 py-1 text-sm rounded-full {formData.services.includes(option)
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}"
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
        class="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        on:click={addService}
      >
        Add
      </button>
    </div>
  </div>