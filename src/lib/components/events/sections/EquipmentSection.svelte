<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';

	export let formData: any;

	let newEquipment = '';

	// Add equipment
	function addEquipment() {
		if (!newEquipment) return;

		if (!formData.equipmentNeeded.includes(newEquipment)) {
			formData.equipmentNeeded = [...formData.equipmentNeeded, newEquipment];
			newEquipment = '';
		}
	}

	// Remove equipment
	function removeEquipment(item: string) {
		formData.equipmentNeeded = formData.equipmentNeeded.filter((e: string) => e !== item);
	}
</script>

<div class="mt-6">
	<h4 class="text-sm font-medium text-gray-700 mb-3">Equipment Needed</h4>

	<!-- Equipment List -->
	<div class="mb-3">
		{#if formData.equipmentNeeded.length === 0}
			<p class="text-gray-500 text-sm italic">No equipment added</p>
		{:else}
			<ul class="space-y-2">
				{#each formData.equipmentNeeded as item}
					<li class="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
						<span>{item}</span>
						<button
							type="button"
							class="text-red-600 hover:text-red-800"
							on:click={() => removeEquipment(item)}
						>
							<Icon name="x" size={16} />
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<!-- Add Equipment -->
	<div class="flex">
		<input
			type="text"
			placeholder="Add equipment item"
			bind:value={newEquipment}
			class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
		/>
		<button
			type="button"
			class="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
			on:click={addEquipment}
		>
			Add
		</button>
	</div>
</div>
