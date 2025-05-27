<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import type { Performer } from '$lib/types';
	import Select from 'svelte-select';

	export let formData: any;
	export let performers: Performer[] = [];

	let selectedPerformer: string | null = null;
	let performerRole = '';
	let performerPay = 0;

	// Format performers for svelte-select
	$: performerOptions = performers.map((p) => ({ value: p.id, label: p.name }));

	// Keep track of selected performers in the dropdown
	let selectedPerformersForDropdown: { value: string; label: string }[] = [];

	// Function to add selected performers to the event
	function addSelectedPerformers() {
		const currentPerformerIds = new Set(formData.performers.map((p: any) => p.id));
		const performersToAdd = selectedPerformersForDropdown
			.filter((selected) => !currentPerformerIds.has(selected.value))
			.map((selected) => performers.find((p) => p.id === selected.value))
			.filter(Boolean); // Filter out any undefined results

		if (performersToAdd.length > 0) {
			// Add only necessary info (id, name) to formData.performers
			formData.performers = [
				...formData.performers,
				...performersToAdd.map((p: any) => ({ id: p.id, name: p.name })) // Store minimal info
			];
		}
		// Clear the dropdown selection after adding (optional, depends on desired UX)
		// selectedPerformersForDropdown = [];
	}

	// Function to remove a performer from the event
	function removePerformer(performerId: string) {
		formData.performers = formData.performers.filter((p: any) => p.id !== performerId);
	}

	// Reactive statement to initialize dropdown selection based on formData
	// Run only once initially or when performers list changes significantly
	$: initialSelected = formData.performers
		? formData.performers
				.map((p: any) => performerOptions.find((opt) => opt.value === p.id))
				.filter(Boolean)
		: [];
	selectedPerformersForDropdown = initialSelected;

	// Get performer name by ID
	function getPerformerName(performerId: string) {
		const performer = performers.find((p: Performer) => p.id === performerId);
		return performer ? performer.name : 'Unknown';
	}
</script>

<div>
	<h3 class="text-lg font-medium text-gray-900 mb-4">Performers</h3>

	<!-- Selected Performers -->
	{#if formData.performers.length === 0}
		<p class="text-gray-500 text-sm italic mb-4">No performers assigned</p>
	{:else}
		<div class="bg-gray-50 rounded-md overflow-hidden mb-4">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-100">
					<tr>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Name
						</th>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Role
						</th>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Pay
						</th>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Status
						</th>
						<th
							scope="col"
							class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Actions
						</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each formData.performers as performer}
						<tr>
							<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
								{performer.displayName || getPerformerName(performer.performer)}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
								{performer.role || '-'}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
								${performer.pay}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm">
								{#if performer.confirmed}
									<span
										class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
									>
										Confirmed
									</span>
								{:else}
									<span
										class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
									>
										Pending
									</span>
								{/if}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
								<button
									type="button"
									class="text-red-600 hover:text-red-900"
									on:click={() => removePerformer(performer.performer)}
								>
									Remove
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	<!-- Add Performer Form -->
	<div class="bg-gray-50 p-4 rounded-md border border-gray-200">
		<h4 class="text-sm font-medium text-gray-700 mb-3">Add Performer</h4>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<!-- Performer Select -->
			<div>
				<label for="performers" class="block text-xs font-medium text-gray-500 mb-1">
					Select Performer
				</label>
				<Select
					id="performers"
					multiple={true}
					items={performerOptions}
					bind:value={selectedPerformersForDropdown}
					placeholder="Search and select performers..."
					on:select={addSelectedPerformers}
					--item-font-size="0.875rem"
					--multi-item-font-size="0.875rem"
				/>
				<a
					href="/performers/new"
					target="_blank"
					class="text-xs text-blue-600 hover:underline mt-1 block"
				>
					+ Add New Performer
				</a>
			</div>

			<!-- Role -->
			<div>
				<label for="performerRole" class="block text-xs font-medium text-gray-500 mb-1">
					Role / Act
				</label>
				<input
					type="text"
					id="performerRole"
					bind:value={performerRole}
					class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					placeholder="e.g. Lead Fire Dancer"
				/>
			</div>

			<!-- Pay -->
			<div>
				<label for="performerPay" class="block text-xs font-medium text-gray-500 mb-1">
					Pay Amount
				</label>
				<input
					type="number"
					id="performerPay"
					bind:value={performerPay}
					min="0"
					step="0.01"
					class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>
			</div>
		</div>

		<div class="mt-4">
			<Button
				type="button"
				on:click={addSelectedPerformers}
				disabled={!selectedPerformersForDropdown.length}
				size="sm"
			>
				<Icon name="plus" size={16} extraClass="mr-1" />
				Add Performer
			</Button>
		</div>
	</div>
</div>
