<script lang="ts">
	export let formData: any;
</script>

<div>
	<h3 class="text-lg font-medium text-gray-900 mb-4">Event Notes</h3>
	<textarea
		id="notes"
		bind:value={formData.notes}
		rows="4"
		class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
		placeholder="Add any internal notes about this event..."
	/>
</div>
