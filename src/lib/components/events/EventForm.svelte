<!-- src/lib/components/events/EventForm.svelte -->
<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { format } from 'date-fns';
	import { clientStore } from '$lib/stores/clientStore';
	import { performerStore } from '$lib/stores/performerStore';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';

	export let event = null;
	export let submitLabel = 'Create Event';
	export let isLoading = false;
	export let showCancelButton = true;
	export let preselectedClientId = null;
	export let preselectedPerformerId = null;

	const dispatch = createEventDispatcher();

	// Form state
	let formData = {
		name: event?.name || '',
		date: event?.date
			? format(new Date(event.date), 'yyyy-MM-dd')
			: format(new Date(), 'yyyy-MM-dd'),
		client: event?.client || preselectedClientId || '',
		location: {
			address: event?.location?.address || '',
			notes: event?.location?.notes || '',
			mapLink: event?.location?.mapLink || ''
		},
		status: event?.status || 'inquiry',
		performers: event?.performers || [],
		services: event?.services || [],
		performanceTime: {
			start: event?.performanceTime?.start || '18:00',
			end: event?.performanceTime?.end || '20:00'
		},
		callTime: event?.callTime || '17:00',
		costume: event?.costume || '',
		equipmentNeeded: event?.equipmentNeeded || [],
		contract: {
			sent: event?.contract?.sent || false,
			sentDate: event?.contract?.sentDate || null,
			received: event?.contract?.received || false,
			receivedDate: event?.contract?.receivedDate || null,
			url: event?.contract?.url || ''
		},
		deposit: {
			required: event?.deposit?.required || false,
			amount: event?.deposit?.amount || 0,
			received: event?.deposit?.received || false,
			receivedDate: event?.deposit?.receivedDate || null
		},
		payment: {
			totalValue: event?.payment?.totalValue || 0,
			paid: event?.payment?.paid || false,
			paidDate: event?.payment?.paidDate || null,
			method: event?.payment?.method || ''
		},
		notes: event?.notes || '',
		clientLiaison: event?.clientLiaison || '',
		gigManager: event?.gigManager || ''
	};

	// Form fields for new items
	let newEquipment = '';
	let newService = '';

	// Form references and selects
	let clients = [];
	let performers = [];
	let selectedPerformer = null;
	let performerRole = '';
	let performerPay = 0;

	// Options for selects
	const statusOptions = [
		{ value: 'inquiry', label: 'Inquiry' },
		{ value: 'confirmed', label: 'Confirmed' },
		{ value: 'deposit-received', label: 'Deposit Received' },
		{ value: 'completed', label: 'Completed' },
		{ value: 'cancelled', label: 'Cancelled' }
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

	const paymentMethodOptions = [
		{ value: 'check', label: 'Check' },
		{ value: 'cash', label: 'Cash' },
		{ value: 'transfer', label: 'Bank Transfer' },
		{ value: 'credit-card', label: 'Credit Card' }
	];

	// Load data when component mounts
	onMount(async () => {
		try {
			// Load clients
			await clientStore.loadClients();
			clients = $clientStore.clients;

			// Load performers
			await performerStore.loadPerformers();
			performers = $performerStore.performers;

			// If we have a preselected performer, add them to the event
			if (preselectedPerformerId) {
				const performer = performers.find((p) => p.id === preselectedPerformerId);
				if (performer) {
					selectedPerformer = performer.id;
				}
			}
		} catch (error) {
			console.error('Error loading form data:', error);
		}
	});

	// Form validation
	function validateForm() {
		if (!formData.name) {
			alert('Event name is required');
			return false;
		}

		if (!formData.date) {
			alert('Event date is required');
			return false;
		}

		if (!formData.client) {
			alert('Please select a client');
			return false;
		}

		if (!formData.location.address) {
			alert('Event location is required');
			return false;
		}

		return true;
	}

	// Handle form submission
	function handleSubmit() {
		if (!validateForm()) return;

		// Convert string dates to Date objects
		const submissionData = {
			...formData,
			date: new Date(formData.date),
			contract: {
				...formData.contract,
				sentDate: formData.contract.sentDate ? new Date(formData.contract.sentDate) : null,
				receivedDate: formData.contract.received ? new Date(formData.contract.receivedDate) : null
			},
			deposit: {
				...formData.deposit,
				receivedDate: formData.deposit.received ? new Date(formData.deposit.receivedDate) : null
			},
			payment: {
				...formData.payment,
				paidDate: formData.payment.paid ? new Date(formData.payment.paidDate) : null
			}
		};

		dispatch('submit', submissionData);
	}

	// Handle cancel button
	function handleCancel() {
		dispatch('cancel');
	}

	// Add performer to event
	function addPerformer() {
		if (!selectedPerformer) return;

		// Check if performer is already added
		if (formData.performers.some((p) => p.performer === selectedPerformer)) {
			alert('This performer is already added to the event');
			return;
		}

		// Get performer name for display
		const performer = performers.find((p) => p.id === selectedPerformer);

		// Add performer to event
		formData.performers = [
			...formData.performers,
			{
				performer: selectedPerformer,
				role: performerRole,
				pay: performerPay,
				confirmed: false,
				displayName: performer ? performer.name : 'Unknown'
			}
		];

		// Reset form fields
		selectedPerformer = null;
		performerRole = '';
		performerPay = 0;
	}

	// Remove performer from event
	function removePerformer(performerId) {
		formData.performers = formData.performers.filter((p) => p.performer !== performerId);
	}

	// Add equipment
	function addEquipment() {
		if (!newEquipment) return;

		if (!formData.equipmentNeeded.includes(newEquipment)) {
			formData.equipmentNeeded = [...formData.equipmentNeeded, newEquipment];
			newEquipment = '';
		}
	}

	// Remove equipment
	function removeEquipment(item) {
		formData.equipmentNeeded = formData.equipmentNeeded.filter((e) => e !== item);
	}

	// Add service
	function addService() {
		if (!newService) return;

		if (!formData.services.includes(newService)) {
			formData.services = [...formData.services, newService];
			newService = '';
		}
	}

	// Remove service
	function removeService(service) {
		formData.services = formData.services.filter((s) => s !== service);
	}

	// Toggle service from predefined list
	function toggleService(service) {
		if (formData.services.includes(service)) {
			formData.services = formData.services.filter((s) => s !== service);
		} else {
			formData.services = [...formData.services, service];
		}
	}

	// Get performer name by ID
	function getPerformerName(performerId) {
		const performer = performers.find((p) => p.id === performerId);
		return performer ? performer.name : 'Unknown';
	}

	// Get client name by ID
	function getClientName(clientId) {
		const client = clients.find((c) => c.id === clientId);
		return client ? client.name : 'Unknown';
	}

	// Update contract sent status
	function updateContractSent(value) {
		formData.contract.sent = value;
		formData.contract.sentDate = value ? new Date() : null;
	}

	// Update contract received status
	function updateContractReceived(value) {
		formData.contract.received = value;
		formData.contract.receivedDate = value ? new Date() : null;
	}

	// Update deposit received status
	function updateDepositReceived(value) {
		formData.deposit.received = value;
		formData.deposit.receivedDate = value ? new Date() : null;

		// If deposit received, update status if it's still an inquiry
		if (value && formData.status === 'inquiry') {
			formData.status = 'deposit-received';
		}
	}

	// Update payment paid status
	function updatePaymentPaid(value) {
		formData.payment.paid = value;
		formData.payment.paidDate = value ? new Date() : null;
	}
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-8">
	<!-- Basic Information Section -->
	<div>
		<h3 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<!-- Event Name -->
			<div>
				<label for="name" class="block text-sm font-medium text-gray-700 mb-1">
					Event Name *
				</label>
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
				<label for="date" class="block text-sm font-medium text-gray-700 mb-1">
					Event Date *
				</label>
				<input
					type="date"
					id="date"
					bind:value={formData.date}
					class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					required
				/>
			</div>

			<!-- Client Selection -->
			<div>
				<label for="client" class="block text-sm font-medium text-gray-700 mb-1"> Client * </label>
				<select
					id="client"
					bind:value={formData.client}
					class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					required
				>
					<option value="">Select a client</option>
					{#each clients as client}
						<option value={client.id}>{client.name}</option>
					{/each}
				</select>
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
				></textarea>
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
				></textarea>
			</div>

			<div>
				<label for="mapLink" class="block text-sm font-medium text-gray-700 mb-1"> Map Link </label>
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

	<!-- Performance Details Section -->
	<div>
		<h3 class="text-lg font-medium text-gray-900 mb-4">Performance Details</h3>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<!-- Start Time -->
			<div>
				<label for="startTime" class="block text-sm font-medium text-gray-700 mb-1">
					Performance Start Time
				</label>
				<input
					type="time"
					id="startTime"
					bind:value={formData.performanceTime.start}
					class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>
			</div>

			<!-- End Time -->
			<div>
				<label for="endTime" class="block text-sm font-medium text-gray-700 mb-1">
					Performance End Time
				</label>
				<input
					type="time"
					id="endTime"
					bind:value={formData.performanceTime.end}
					class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>
			</div>

			<!-- Call Time -->
			<div>
				<label for="callTime" class="block text-sm font-medium text-gray-700 mb-1">
					Call Time
				</label>
				<input
					type="time"
					id="callTime"
					bind:value={formData.callTime}
					class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>
			</div>

			<!-- Costume -->
			<div class="md:col-span-3">
				<label for="costume" class="block text-sm font-medium text-gray-700 mb-1">
					Costume Notes
				</label>
				<textarea
					id="costume"
					bind:value={formData.costume}
					rows="2"
					class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					placeholder="e.g. All white, formal wear, themed costumes..."
				></textarea>
			</div>
		</div>

		<!-- Services Section -->
		<div class="mt-6">
			<h4 class="text-sm font-medium text-gray-700 mb-3">Services</h4>

			<!-- Selected Services -->
			<div class="flex flex-wrap gap-2 mb-3">
				{#each formData.services as service}
					<div
						class="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm"
					>
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

		<!-- Equipment Section -->
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
	</div>

	<!-- Performers Section -->
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
					<label for="performer" class="block text-xs font-medium text-gray-500 mb-1">
						Select Performer
					</label>
					<select
						id="performer"
						bind:value={selectedPerformer}
						class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						<option value={null}>Select performer</option>
						{#each performers as performer}
							<option value={performer.id}>{performer.name}</option>
						{/each}
					</select>
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
				<Button type="button" on:click={addPerformer} disabled={!selectedPerformer} size="sm">
					<Icon name="plus" size={16} class="mr-1" />
					Add Performer
				</Button>
			</div>
		</div>
	</div>

	<!-- Contract & Payment Section -->
	<div>
		<h3 class="text-lg font-medium text-gray-900 mb-4">Contract & Payment</h3>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<!-- Contract Information -->
			<div class="bg-gray-50 p-4 rounded-md border border-gray-200">
				<h4 class="text-sm font-medium text-gray-700 mb-3">Contract Information</h4>

				<div class="space-y-4">
					<!-- Contract Sent -->
					<div class="flex items-center">
						<input
							type="checkbox"
							id="contractSent"
							checked={formData.contract.sent}
							on:change={(e) => updateContractSent(e.target.checked)}
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
							on:change={(e) => updateContractReceived(e.target.checked)}
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

			<!-- Payment Information -->
			<div class="bg-gray-50 p-4 rounded-md border border-gray-200">
				<h4 class="text-sm font-medium text-gray-700 mb-3">Payment Information</h4>

				<div class="space-y-4">
					<!-- Total Value -->
					<div>
						<label for="totalValue" class="block text-sm font-medium text-gray-700 mb-1">
							Total Event Value
						</label>
						<div class="relative rounded-md shadow-sm">
							// src/lib/components/events/EventForm.svelte // ... (previous code) ...              
							  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<span class="text-gray-500 sm:text-sm">$</span>
							</div><input
								type="number"
								id="totalValue"
								bind:value={formData.payment.totalValue}
								min="0"
								step="0.01"
								class="w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
								placeholder="0.00"
							/>
							<div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
								<span class="text-gray-500 sm:text-sm">USD</span>
							</div>
						</div>
					</div>
					<div class="pt-4 border-t border-gray-200 mt-4">
						<h5 class="text-xs font-medium text-gray-500 mb-2">Deposit</h5>
						<div class="flex items-center mb-2">
							<input
								type="checkbox"
								id="depositRequired"
								bind:checked={formData.deposit.required}
								class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
							/>
							<label for="depositRequired" class="ml-2 block text-sm text-gray-700">
								Deposit Required
							</label>
						</div>

						{#if formData.deposit.required}
							<div class="grid grid-cols-2 gap-4">
								<div>
									<label for="depositAmount" class="block text-xs font-medium text-gray-500 mb-1">
										Deposit Amount
									</label>
									<div class="relative rounded-md shadow-sm">
										<div
											class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
										>
											<span class="text-gray-500 sm:text-sm">$</span>
										</div><input
											type="number"
											id="depositAmount"
											bind:value={formData.deposit.amount}
											min="0"
											step="0.01"
											class="w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
										/>
									</div>
								</div>
								<div>
									<div class="flex items-center h-full mt-4">
										<input
											type="checkbox"
											id="depositReceived"
											checked={formData.deposit.received}
											on:change={(e) => updateDepositReceived(e.target.checked)}
											class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
										/>
										<label for="depositReceived" class="ml-2 block text-sm text-gray-700">
											Deposit Received
										</label>
									</div>
								</div>
							</div>
						{/if}
					</div>
					<div class="pt-4 border-t border-gray-200 mt-4">
						<h5 class="text-xs font-medium text-gray-500 mb-2">Final Payment</h5>
						<div class="flex items-center mb-2">
							<input
								type="checkbox"
								id="paymentPaid"
								checked={formData.payment.paid}
								on:change={(e) => updatePaymentPaid(e.target.checked)}
								class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
							/>
							<label for="paymentPaid" class="ml-2 block text-sm text-gray-700">
								Final Payment Received
							</label>
						</div>

						{#if formData.payment.paid}
							<div>
								<label for="paymentMethod" class="block text-sm font-medium text-gray-700 mb-1">
									Payment Method
								</label>
								<select
									id="paymentMethod"
									bind:value={formData.payment.method}
									class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								>
									<option value="">Select method</option>
									{#each paymentMethodOptions as option}
										<option value={option.value}>{option.label}</option>
									{/each}
								</select>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
	<div>
		<h3 class="text-lg font-medium text-gray-900 mb-4">Event Notes</h3><textarea
			id="notes"
			bind:value={formData.notes}
			rows="4"
			class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			placeholder="Add any internal notes about this event..."
		></textarea>
	</div>
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
	<div class="flex justify-end space-x-3 pt-6 border-t">
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

		<Button type="submit" loading={isLoading} disabled={isLoading}>
			{submitLabel}
		</Button>
	</div>
</form>
