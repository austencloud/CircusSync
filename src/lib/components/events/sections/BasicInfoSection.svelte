<script lang="ts">
	import type { Client } from '$lib/types';
	import Select from 'svelte-select'; // Import svelte-select
	import Flatpickr from 'svelte-flatpickr'; // Import svelte-flatpickr
	import 'flatpickr/dist/flatpickr.css'; // Import flatpickr CSS

	export let formData: any;
	export let clients: Client[] = [];
	export let statusOptions: any[] = [];

	// Format clients for svelte-select
	$: clientOptions = clients.map((c) => ({ value: c.id, label: c.name }));
	$: selectedClient = clientOptions.find((c) => c.value === formData.client);

	// Handle client selection change
	function handleClientChange(event: CustomEvent<{ value: string; label: string } | null>) {
		formData.client = event.detail ? event.detail.value : '';
	}

	// Flatpickr configuration for date
	const dateConfig = {
		altInput: true,
		altFormat: 'M j, Y',
		dateFormat: 'Y-m-d'
	};
</script>

<div>
	<h3 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<!-- Event Name -->
		<div>
			<label for="name" class="block text-sm font-medium text-gray-700 mb-1"> Event Name * </label>
			<input
				type="text"
				id="name"
				bind:value={formData.name}
				class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				required
			/>
		</div>

		<!-- Event Date -->
		<div>
			<label for="eventDate" class="block text-sm font-medium text-gray-700 mb-1">
				Event Date *
			</label>
			<!-- Fixed: Using options instead of config -->
			<Flatpickr
				id="eventDate"
				bind:value={formData.date}
				options={dateConfig}
				class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				required
			/>
		</div>

		<!-- Client Selection -->
		<div>
			<label for="client" class="block text-sm font-medium text-gray-700 mb-1">Client *</label>
			<!-- Fixed: Using items instead of options -->
			<Select
				id="client"
				items={clientOptions}
				bind:value={selectedClient}
				on:select={handleClientChange}
				placeholder="Select a client..."
				isClearable={true}
				required
			/>
			<!-- Add link to create new client -->
			<a
				href="/clients/new"
				target="_blank"
				class="text-xs text-blue-600 hover:underline mt-1 block"
			>
				+ Add New Client
			</a>
		</div>

		<!-- Event Status -->
		<div>
			<label for="status" class="block text-sm font-medium text-gray-700 mb-1">
				Event Status
			</label>
			<select
				id="status"
				bind:value={formData.status}
				class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			>
				{#each statusOptions as option}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</div>

		<!-- Event Location -->
		<div class="md:col-span-2">
			<label for="location" class="block text-sm font-medium text-gray-700 mb-1">
				Location Address *
			</label>
			<textarea
				id="location"
				bind:value={formData.location.address}
				rows="2"
				class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				required
			/>
		</div>

		<div>
			<label for="locationNotes" class="block text-sm font-medium text-gray-700 mb-1">
				Location Notes
			</label>
			<textarea
				id="locationNotes"
				bind:value={formData.location.notes}
				rows="2"
				class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			/>
		</div>

		<div>
			<label for="mapLink" class="block text-sm font-medium text-gray-700 mb-1">Map Link</label>
			<input
				type="url"
				id="mapLink"
				bind:value={formData.location.mapLink}
				class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				placeholder="https://maps.google.com/..."
			/>
		</div>
	</div>
</div>