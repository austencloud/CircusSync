<script lang="ts">
    export let formData: any;
  </script>
  
  <div>
    <h3 class="text-lg font-medium text-gray-900 mb-4">Management</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="clientLiaison" class="block text-sm font-medium text-gray-700 mb-1">
          Client Liaison (Main Contact)
        </label>
        <input
          type="text"
          id="clientLiaison"
          bind:value={formData.clientLiaison}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label for="gigManager" class="block text-sm font-medium text-gray-700 mb-1">
          Gig Manager (Team Lead)
        </label>
        <input
          type="text"
          id="gigManager"
          bind:value={formData.gigManager}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  </div>