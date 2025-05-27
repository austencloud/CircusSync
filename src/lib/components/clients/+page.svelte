<!-- src/routes/clients/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { clientStore } from '$lib/stores/clientStore';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
	import ClientForm from '$lib/components/clients/ClientForm.svelte';
	import type { Client } from '$lib/types';

	// State variables
	let loading = true;
	let searchTerm = '';
	let statusFilter = 'all';
	let showAddClientModal = false;
	let showFilterPanel = false;

	// All functionality is now accessible without authentication
	const canAddClient = true;

	// Get URL query parameters
	$: urlFilter = $page.url.searchParams.get('filter') || 'all';

	// Status filter options
	const statusOptions = [
		{ value: 'all', label: 'All Clients' },
		{ value: 'active', label: 'Active' },
		{ value: 'inactive', label: 'Inactive' },
		{ value: 'lead', label: 'Leads' },
		{ value: 'yearly', label: 'Yearly' },
		{ value: 'follow-up', label: 'Need Follow-up' }
	];

	// Initialize page
	onMount(async () => {
		try {
			// Set the filter from URL if it exists
			if (urlFilter && urlFilter !== 'all') {
				statusFilter = urlFilter;
			}

			// Load clients based on filter
			if (statusFilter === 'follow-up') {
				await clientStore.loadFollowUpClients();
			} else if (statusFilter !== 'all') {
				// Type check to ensure statusFilter is a valid ClientStatus
				if (
					statusFilter === 'active' ||
					statusFilter === 'inactive' ||
					statusFilter === 'lead' ||
					statusFilter === 'yearly'
				) {
					await clientStore.loadClientsByStatus(statusFilter as ClientStatus);
				} else {
					// Fallback to loading all clients if status is invalid
					await clientStore.loadClients();
				}
			} else {
				await clientStore.loadClients();
			}
		} catch (error) {
			console.error('Error loading clients:', error);
		} finally {
			loading = false;
		}
	});

	// Filter clients based on search term
	$: filteredClients = $clientStore.clients.filter((client) => {
		if (!searchTerm) return true;

		const search = searchTerm.toLowerCase();
		return (
			client.name.toLowerCase().includes(search) ||
			client.contactPerson.toLowerCase().includes(search) ||
			client.email.toLowerCase().includes(search) ||
			client.phone.toLowerCase().includes(search)
		);
	});

	// Sort clients alphabetically by name
	$: sortedClients = filteredClients.sort((a, b) => a.name.localeCompare(b.name));

	// Define valid status types
	type ClientStatus = 'active' | 'inactive' | 'lead' | 'yearly';

	// Handle filter change
	async function handleFilterChange() {
		loading = true;

		try {
			// Update URL query parameter
			goto(`/clients?filter=${statusFilter}`, { replaceState: true });

			// Load clients based on filter
			if (statusFilter === 'follow-up') {
				await clientStore.loadFollowUpClients();
			} else if (statusFilter !== 'all') {
				// Type check to ensure statusFilter is a valid ClientStatus
				if (
					statusFilter === 'active' ||
					statusFilter === 'inactive' ||
					statusFilter === 'lead' ||
					statusFilter === 'yearly'
				) {
					await clientStore.loadClientsByStatus(statusFilter as ClientStatus);
				} else {
					// Fallback to loading all clients if status is invalid
					await clientStore.loadClients();
				}
			} else {
				await clientStore.loadClients();
			}
		} catch (error) {
			console.error('Error filtering clients:', error);
		} finally {
			loading = false;
			showFilterPanel = false; // Close filter panel on mobile
		}
	}

	// Toggle mobile filter panel
	function toggleFilterPanel() {
		showFilterPanel = !showFilterPanel;
	}

	// Handle search form submission
	function handleSearch() {
		// The search is already reactive through the binding of searchTerm
		// This function just prevents the default form submission
	}

	// Handle client add
	async function handleAddClient(event: CustomEvent<Client>) {
		try {
			const clientData = event.detail;
			const clientId = await clientStore.addClient(clientData);
			showAddClientModal = false;

			// Refresh client list
			if (statusFilter !== 'all') {
				await clientStore.loadClients();
			}

			// Navigate to the new client
			goto(`/clients/${clientId}`);
		} catch (error) {
			console.error('Error adding client:', error);
		}
	}

	// Get status badge color
	function getStatusColor(
		status: string
	): 'blue' | 'green' | 'red' | 'amber' | 'gray' | 'purple' | undefined {
		switch (status) {
			case 'active':
				return 'green';
			case 'inactive':
				return 'gray';
			case 'lead':
				return 'blue';
			case 'yearly':
				return 'purple';
			default:
				return 'gray';
		}
	}
</script>

<svelte:head>
	<title>Clients | CircusSync</title>
</svelte:head>

<div class="bg-white shadow">
	<div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
		<div class="flex flex-col md:flex-row md:items-center justify-between">
			<h1 class="text-2xl font-bold text-gray-900">Clients</h1>

			<div class="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
				<!-- Filter button (mobile) -->
				<button
					type="button"
					class="sm:hidden inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					on:click={toggleFilterPanel}
				>
					<Icon name="filter" size={18} extraClass="mr-1" />
					Filter
				</button>

				{#if canAddClient}
					<Button on:click={() => (showAddClientModal = true)}>
						<Icon name="plus" size={18} extraClass="mr-1" />
						Add Client
					</Button>
				{/if}
			</div>
		</div>
	</div>
</div>

<div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
	<div class="mb-6 flex flex-col sm:flex-row justify-between gap-4">
		<!-- Search -->
		<div class="w-full sm:w-auto flex-1 max-w-md">
			<form on:submit|preventDefault={handleSearch} class="flex">
				<div class="relative flex-grow">
					<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Icon name="search" size={18} extraClass="text-gray-400" />
					</div>
					<input
						type="text"
						bind:value={searchTerm}
						class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
						placeholder="Search clients..."
					/>
				</div>
				<Button type="submit" className="ml-2" variant="outline">Search</Button>
			</form>
		</div>

		<!-- Status filter (desktop) -->
		<div class="hidden sm:block">
			<select
				bind:value={statusFilter}
				on:change={handleFilterChange}
				class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
			>
				{#each statusOptions as option}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Mobile filter panel -->
	{#if showFilterPanel}
		<div class="sm:hidden bg-gray-50 rounded-md p-4 mb-6">
			<h3 class="text-lg font-medium text-gray-900">Filters</h3>

			<div class="mt-4">
				<label for="mobile-status-filter" class="block text-sm font-medium text-gray-700">
					Client Status
				</label>
				<select
					id="mobile-status-filter"
					bind:value={statusFilter}
					class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
				>
					{#each statusOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>

			<div class="mt-4 flex justify-end">
				<Button size="sm" on:click={handleFilterChange}>Apply Filters</Button>
			</div>
		</div>
	{/if}

	{#if loading}
		<div class="flex justify-center py-12">
			<LoadingSpinner size="lg" />
		</div>
	{:else if sortedClients.length === 0}
		<div class="bg-white rounded-lg shadow-sm p-6 text-center">
			<Icon name="users" size={48} extraClass="mx-auto text-gray-400 mb-4" />
			<h3 class="text-lg font-medium text-gray-900 mb-1">No clients found</h3>
			<p class="text-gray-500">
				{searchTerm
					? `No clients matching "${searchTerm}"`
					: statusFilter !== 'all'
					? `No ${statusFilter} clients found`
					: 'You have no clients yet'}
			</p>

			{#if canAddClient}
				<Button on:click={() => (showAddClientModal = true)} className="mt-4">
					<Icon name="plus" size={18} extraClass="mr-1" />
					Add Your First Client
				</Button>
			{/if}
		</div>
	{:else}
		<div class="bg-white shadow overflow-hidden sm:rounded-md">
			<ul class="divide-y divide-gray-200">
				{#each sortedClients as client (client.id)}
					<li>
						<a href="/clients/{client.id}" class="block hover:bg-gray-50">
							<div class="px-4 py-4 sm:px-6">
								<div class="flex items-center justify-between">
									<div>
										<p class="text-lg font-medium text-blue-600 truncate">
											{client.name}
										</p>
										<p class="text-sm text-gray-600">
											{client.contactPerson}
										</p>
									</div>
									<div class="ml-2 flex-shrink-0 flex">
										<Badge color={getStatusColor(client.status)}>
											{client.status.charAt(0).toUpperCase() + client.status.slice(1)}
										</Badge>
									</div>
								</div>
								<div class="mt-2 sm:flex sm:justify-between">
									<div class="sm:flex">
										{#if client.email}
											<div class="flex items-center text-sm text-gray-500">
												<Icon
													name="mail"
													size={16}
													extraClass="flex-shrink-0 mr-1.5 text-gray-400"
												/>
												{client.email}
											</div>
										{/if}
										{#if client.phone}
											<div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
												<Icon
													name="phone"
													size={16}
													extraClass="flex-shrink-0 mr-1.5 text-gray-400"
												/>
												{client.phone}
											</div>
										{/if}
									</div>
									<div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
										{#if client.nextFollowUp && client.nextFollowUp.date}
											<div class="flex items-center">
												<Icon
													name="bell"
													size={16}
													extraClass="flex-shrink-0 mr-1.5 text-gray-400"
												/>
												<span class="text-amber-600 font-medium">Follow-up needed</span>
											</div>
										{:else if client.lastContacted}
											<div class="flex items-center">
												<Icon
													name="calendar"
													size={16}
													extraClass="flex-shrink-0 mr-1.5 text-gray-400"
												/>
												Last contacted: {new Date(client.lastContacted).toLocaleDateString()}
											</div>
										{/if}
									</div>
								</div>
							</div>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>

<!-- Add Client Modal -->
{#if showAddClientModal}
	<Modal title="Add New Client" size="lg" on:close={() => (showAddClientModal = false)}>
		<ClientForm on:submit={handleAddClient} on:cancel={() => (showAddClientModal = false)} />
	</Modal>
{/if}
