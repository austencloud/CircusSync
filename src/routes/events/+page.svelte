<script lang="ts">
	import { onMount } from 'svelte';
	import { format } from 'date-fns';
	import { eventStore } from '$lib/stores/eventStore';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';

	// State management
	let loading = true;
	let searchTerm = '';
	let filterStatus = 'all';
	let currentView = 'list'; // 'list' or 'calendar'
	let showFilterPanel = false;

	// All functionality is now accessible without authentication
	const canManageEvents = true;

	// Status filter options
	const statusOptions = [
		{ value: 'all', label: 'All Events' },
		{ value: 'upcoming', label: 'Upcoming' },
		{ value: 'inquiry', label: 'Inquiries' },
		{ value: 'confirmed', label: 'Confirmed' },
		{ value: 'deposit-received', label: 'Deposit Received' },
		{ value: 'completed', label: 'Completed' },
		{ value: 'cancelled', label: 'Cancelled' }
	];

	// Initialize page
	onMount(async () => {
		try {
			// --- FIX START ---
			// 3. Removed store checking and subscription from here
			// const checkRole = checkUserRole('manager'); // REMOVED
			// canManageEvents = $checkRole; // REMOVED
			// --- FIX END ---

			// Load all events
			await eventStore.loadEvents();
		} catch (error) {
			console.error('Error loading events:', error);
		} finally {
			loading = false;
		}
	});

	// Reactive filtered events (this was already correct)
	$: filteredEvents = $eventStore.events.filter((event) => {
		// First apply status filter
		if (filterStatus !== 'all') {
			if (filterStatus === 'upcoming') {
				// For upcoming, check date
				const today = new Date();
				// Ensure event date is valid before comparison
				if (!(event.date instanceof Date) || isNaN(event.date.getTime())) return false;
				if (event.date < today || event.status === 'cancelled' || event.status === 'completed') {
					return false;
				}
			} else if (event.status !== filterStatus) {
				return false;
			}
		}

		// Then apply search filter if any
		if (searchTerm) {
			const search = searchTerm.toLowerCase();
			return (
				event.name.toLowerCase().includes(search) ||
				(event.location?.address && event.location.address.toLowerCase().includes(search)) ||
				(event.clientLiaison && event.clientLiaison.toLowerCase().includes(search)) ||
				(event.gigManager && event.gigManager.toLowerCase().includes(search))
			);
		}

		return true;
	});

	// Sort events by date (this was already correct, added date validation)
	$: sortedEvents = [...filteredEvents].sort((a, b) => {
		// Get current date
		const today = new Date();
		today.setHours(0, 0, 0, 0); // Normalize today to the start of the day for comparisons

		// Ensure dates are valid Date objects
		const dateA = a.date instanceof Date && !isNaN(a.date.getTime()) ? a.date : new Date(0); // Use epoch if invalid
		const dateB = b.date instanceof Date && !isNaN(b.date.getTime()) ? b.date : new Date(0); // Use epoch if invalid

		const isAPast = dateA < today;
		const isBPast = dateB < today;

		// If both dates are in the past
		if (isAPast && isBPast) {
			// Sort descending (most recent first)
			return dateB.getTime() - dateA.getTime();
		}

		// If both dates are today or in the future
		if (!isAPast && !isBPast) {
			// Sort ascending (soonest first)
			return dateA.getTime() - dateB.getTime();
		}

		// If one is past and one is future, future comes first
		return isAPast ? 1 : -1;
	});

	// Handle search
	function handleSearch() {
		// No need to do anything, the reactive $: takes care of filtering
	}

	// Helper functions
	function getStatusColor(
		status: string
	): 'blue' | 'green' | 'red' | 'amber' | 'gray' | 'purple' | undefined {
		switch (status) {
			case 'confirmed':
				return 'green';
			case 'deposit-received':
				return 'blue';
			case 'inquiry':
				return 'gray';
			case 'completed':
				return 'purple';
			case 'cancelled':
				return 'red';
			default:
				return 'gray';
		}
	}

	function getStatusText(status: string): string {
		switch (status) {
			case 'deposit-received':
				return 'Deposit Received';
			default:
				// Handle potential null/undefined status gracefully
				return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
		}
	}

	function isEventUpcoming(date: Date | undefined | null): boolean {
		if (!(date instanceof Date) || isNaN(date.getTime())) return false; // Handle invalid dates
		const today = new Date();
		today.setHours(0, 0, 0, 0); // Compare against the start of today
		return date >= today;
	}

	function formatEventDate(date: Date | undefined | null): string {
		if (!(date instanceof Date) || isNaN(date.getTime())) return 'Invalid Date'; // Handle invalid dates

		const today = new Date();
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		// Normalize dates to compare day only
		const eventDateStr = date.toDateString();
		const todayStr = today.toDateString();
		const tomorrowStr = tomorrow.toDateString();

		if (eventDateStr === todayStr) {
			return 'Today';
		} else if (eventDateStr === tomorrowStr) {
			return 'Tomorrow';
		} else {
			// Use date-fns format - ensure date is valid
			return format(date, 'MMM d, yyyy');
		}
	}

	function toggleFilterPanel() {
		showFilterPanel = !showFilterPanel;
	}

	function toggleView() {
		currentView = currentView === 'list' ? 'calendar' : 'list';
	}
</script>

<svelte:head>
	<title>Events | CircusSync</title>
</svelte:head>

<div class="bg-white shadow">
	<div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
		<div class="flex flex-col md:flex-row md:items-center justify-between">
			<h1 class="text-2xl font-bold text-gray-900">Events</h1>

			<div class="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
				<div class="inline-flex rounded-md shadow-sm" role="group">
					<button
						type="button"
						class={`
                            px-4 py-2 text-sm font-medium border border-gray-300
                            ${
															currentView === 'list'
																? 'bg-blue-50 text-blue-700 border-blue-300 z-10'
																: 'bg-white text-gray-700 hover:bg-gray-50'
														}
                            rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500
                        `}
						on:click={() => (currentView = 'list')}
					>
						<Icon name="list" size={18} extraClass="mr-1 inline-block align-middle" />
						<span class="inline-block align-middle">List</span>
					</button>
					<button
						type="button"
						class={`
                            px-4 py-2 text-sm font-medium border border-gray-300
                            ${
															currentView === 'calendar'
																? 'bg-blue-50 text-blue-700 border-blue-300 z-10'
																: 'bg-white text-gray-700 hover:bg-gray-50'
														}
                            rounded-r-md focus:outline-none focus:ring-1 focus:ring-blue-500
                        `}
						on:click={() => (currentView = 'calendar')}
					>
						<Icon name="calendar" size={18} extraClass="mr-1 inline-block align-middle" />
						<span class="inline-block align-middle">Calendar</span>
					</button>
				</div>

				<button
					type="button"
					class="sm:hidden inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					on:click={toggleFilterPanel}
				>
					<Icon name="filter" size={18} extraClass="mr-1" />
					Filter
				</button>

				{#if canManageEvents}
					<Button href="/events/new">
						<Icon name="plus" size={18} extraClass="mr-1" />
						New Event
					</Button>
				{/if}
			</div>
		</div>
	</div>
</div>

<div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
	<div class="mb-6 flex flex-col sm:flex-row justify-between gap-4">
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
						placeholder="Search events..."
					/>
				</div>
				<Button type="submit" className="ml-2" variant="outline">Search</Button>
			</form>
		</div>

		<div class="hidden sm:block">
			<select
				bind:value={filterStatus}
				class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
			>
				{#each statusOptions as option}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</div>
	</div>

	{#if showFilterPanel}
		<div class="sm:hidden bg-gray-50 rounded-md p-4 mb-6">
			<h3 class="text-lg font-medium text-gray-900">Filters</h3>

			<div class="mt-4">
				<label for="mobile-status-filter" class="block text-sm font-medium text-gray-700">
					Status
				</label>
				<select
					id="mobile-status-filter"
					bind:value={filterStatus}
					class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
				>
					{#each statusOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>

			<div class="mt-4 flex justify-end">
				<Button size="sm" on:click={toggleFilterPanel}>Apply Filters</Button>
			</div>
		</div>
	{/if}

	{#if loading}
		<div class="flex justify-center py-12">
			<LoadingSpinner size="lg" />
		</div>
	{:else if sortedEvents.length === 0}
		<div class="bg-white rounded-lg shadow-sm p-6 text-center">
			<Icon name="calendar" size={48} extraClass="mx-auto text-gray-400 mb-4" />
			<h3 class="text-lg font-medium text-gray-900 mb-1">No events found</h3>
			<p class="text-gray-500">
				{searchTerm
					? `No events matching "${searchTerm}"`
					: filterStatus !== 'all'
					? `No ${
							statusOptions.find((o) => o.value === filterStatus)?.label || filterStatus
					  } events found`
					: 'You have no events yet'}
			</p>

			{#if canManageEvents}
				<Button href="/events/new" className="mt-4">
					<Icon name="plus" size={18} extraClass="mr-1" />
					Create an Event
				</Button>
			{/if}
		</div>
	{:else if currentView === 'list'}
		<div class="bg-white shadow overflow-hidden sm:rounded-md">
			<ul class="divide-y divide-gray-200">
				{#each sortedEvents as event (event.id)}
					<li>
						<a href="/events/{event.id}" class="block hover:bg-gray-50">
							<div class="px-4 py-4 sm:px-6">
								<div class="flex items-center justify-between">
									<div class="flex items-center">
										<p class="text-lg font-medium text-blue-600 truncate">
											{event.name || 'Unnamed Event'}
										</p>
										<Badge color={getStatusColor(event.status)} className="ml-2 shrink-0">
											{getStatusText(event.status)}
										</Badge>
									</div>
									<div class="ml-2 flex-shrink-0 flex">
										<p
											class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
												isEventUpcoming(event.date)
													? 'bg-green-100 text-green-800'
													: 'bg-gray-100 text-gray-800'
											}`}
										>
											{formatEventDate(event.date)}
										</p>
									</div>
								</div>
								<div class="mt-2 sm:flex sm:justify-between">
									<div class="sm:flex sm:flex-wrap">
										<div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 mr-4">
											<Icon
												name="map-pin"
												size={16}
												extraClass="flex-shrink-0 mr-1.5 text-gray-400"
											/>
											{event.location?.address?.split(',')[0] || 'No location'}
										</div>
										<div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 mr-4">
											<Icon
												name="clock"
												size={16}
												extraClass="flex-shrink-0 mr-1.5 text-gray-400"
											/>
											{event.performanceTime?.start || 'N/A'} - {event.performanceTime?.end ||
												'N/A'}
										</div>
										<div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
											<Icon
												name="users"
												size={16}
												extraClass="flex-shrink-0 mr-1.5 text-gray-400"
											/>
											{event.performers?.length || 0} performers
										</div>
									</div>
									<div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
										<Icon
											name="dollar-sign"
											size={16}
											extraClass="flex-shrink-0 mr-1.5 text-gray-400"
										/>
										${event.payment?.totalValue?.toFixed(2) || '0.00'}
									</div>
								</div>
							</div>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{:else}
		<div class="bg-white rounded-lg shadow p-6 text-center">
			<Icon name="calendar" size={48} extraClass="mx-auto text-gray-400 mb-4" />
			<h3 class="text-lg font-medium text-gray-900 mb-1">Calendar View</h3>
			<p class="text-gray-500">
				Calendar view implementation is pending. Displaying events for April 2025 as a placeholder.
			</p>
			<div class="mt-4 border rounded-md overflow-hidden">
				<div class="p-4 border-b">
					<div class="flex items-center justify-between">
						<h2 class="text-lg font-medium text-gray-900">April 2025</h2>
						<div class="flex space-x-2">
							<button class="p-1 rounded-full hover:bg-gray-100">
								<Icon name="chevron-left" size={20} />
							</button>
							<button class="p-1 rounded-full hover:bg-gray-100">
								<Icon name="chevron-right" size={20} />
							</button>
							<button class="p-1 ml-2 text-sm text-blue-600 hover:text-blue-800"> Today </button>
						</div>
					</div>
				</div>
				<div class="grid grid-cols-7 gap-px bg-gray-200 border-t">
					{#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as day}
						<div class="bg-gray-50 py-2 text-center text-sm font-medium text-gray-500">
							{day}
						</div>
					{/each}
					{#each Array(35) as _, i}
						{@const dayNum = i - 2}
						{@const isCurrentMonth = dayNum > 0 && dayNum <= 30}
						{@const isTodayPlaceholder = dayNum === 18}
						<div
							class={`min-h-24 bg-white p-1 relative ${
								isCurrentMonth ? '' : 'bg-gray-50 text-gray-400'
							}`}
						>
							{#if isCurrentMonth}
								<span
									class={`absolute top-1 right-1 text-xs ${
										isTodayPlaceholder
											? 'bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center'
											: ''
									}`}
								>
									{dayNum}
								</span>
								{#if dayNum === 6}
									<div class="mt-6 text-[0.6rem] p-0.5 rounded bg-blue-100 text-blue-800 truncate">
										Event Placeholder
									</div>{/if}
								{#if dayNum === 14}
									<div
										class="mt-6 text-[0.6rem] p-0.5 rounded bg-green-100 text-green-800 truncate"
									>
										Another Event
									</div>{/if}
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
