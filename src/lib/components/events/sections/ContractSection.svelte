<script lang="ts">
    import { format } from 'date-fns';
    
    export let formData: any;
    
    function handleContractSentChange(e: Event) {
      const target = e.target as HTMLInputElement;
      updateContractSent(target.checked);
    }
    
    function handleContractReceivedChange(e: Event) {
      const target = e.target as HTMLInputElement;
      updateContractReceived(target.checked);
    }
    
    function updateContractSent(value: boolean) {
      formData.contract.sent = value;
      formData.contract.sentDate = value ? new Date() : null;
    }
    
    function updateContractReceived(value: boolean) {
      formData.contract.received = value;
      formData.contract.receivedDate = value ? new Date() : null;
    }
  </script>
  
  <div class="bg-gray-50 p-4 rounded-md border border-gray-200">
    <h4 class="text-sm font-medium text-gray-700 mb-3">Contract Information</h4>
  
    <div class="space-y-4">
      <!-- Contract Sent -->
      <div class="flex items-center">
        <input
          type="checkbox"
          id="contractSent"
          bind:checked={formData.contract.sent}
          on:change={handleContractSentChange}
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label for="contractSent" class="ml-2 block text-sm text-gray-700">
          Contract Sent
        </label>
  
        {#if formData.contract.sent && formData.contract.sentDate}
          <span class="ml-2 text-xs text-gray-500">
            ({format(new Date(formData.contract.sentDate), 'MMM d, yyyy')})
          </span>
        {/if}
      </div>
  
      <!-- Contract Received -->
      <div class="flex items-center">
        <input
          type="checkbox"
          id="contractReceived"
          checked={formData.contract.received}
          on:change={handleContractReceivedChange}
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label for="contractReceived" class="ml-2 block text-sm text-gray-700">
          Contract Received
        </label>
  
        {#if formData.contract.received && formData.contract.receivedDate}
          <span class="ml-2 text-xs text-gray-500">
            ({format(new Date(formData.contract.receivedDate), 'MMM d, yyyy')})
          </span>
        {/if}
      </div>
  
      <!-- Contract URL -->
      <div>
        <label for="contractUrl" class="block text-sm font-medium text-gray-700 mb-1">
          Contract URL
        </label>
        <input
          type="url"
          id="contractUrl"
          bind:value={formData.contract.url}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://example.com/contract.pdf"
        />
      </div>
    </div>
  </div>