<!-- src/routes/events/[id]/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { eventStore } from '$lib/stores/eventStore';
	import { clientStore } from '$lib/stores/clientStore';
	import { performerStore } from '$lib/stores/performerStore';
	import Button from '$lib/components/ui/Button.svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
	import type { EventStatus } from '$lib/types';
	import EventHeader from './components/EventHeader.svelte';
	import EventTabs from './components/EventTabs.svelte';
	import EventForm from '$lib/components/events/EventForm.svelte';

	// Import local components

	// State management
	let loading = true;
	let activeTab = 'details';
	let showEditModal = false;
	let showDeleteConfirm = false;
	let isDeleting = false;
	let showEditNotesModal = false;
	let notesForEditing = '';
	let isNewEvent = false;

	// All functionality is now accessible without authentication
	const canEdit = true;

	const eventId = $page.params.id;
	isNewEvent = eventId === 'new'; // Check if it's a new event

	onMount(async () => {
		if (isNewEvent) {
			// It's a new event, don't load data, just finish loading state
			loading = false;
			// Optionally initialize a default event structure if needed by the template/form
			// eventStore.selectedEvent.set({ /* default structure */ });
			return;
		}

		// Existing event logic
		try {
			// Load data
			await Promise.all([
				eventStore.loadEvent(eventId),
				eventStore.loadPerformersForEvent(eventId)
			]);

			if ($eventStore.selectedEvent?.client) {
				await clientStore.loadClient($eventStore.selectedEvent.client);
			}
		} catch (error) {
			console.error('Error loading event data:', error);
			// Consider setting an error state here to display to the user
		} finally {
			loading = false;
		}
	});

	// Reactive variables
	$: event = $eventStore.selectedEvent;
	$: client = $clientStore.selectedClient;
	$: eventPerformers = $eventStore.eventPerformers;

	// Handler functions
	async function handleDelete() {
		if (!event || isNewEvent) return; // Don't delete if new
		isDeleting = true;

		try {
			await eventStore.deleteEvent(event.id);
			window.location.href = '/events';
		} catch (error) {
			console.error('Error deleting event:', error);
			isDeleting = false;
			showDeleteConfirm = false;
		}
	}

	async function handleStatusChange(newStatus: string) {
		if (!event || isNewEvent) return; // Don't update status if new
		try {
			await eventStore.updateEvent(event.id, { status: newStatus as EventStatus });
		} catch (error) {
			console.error('Error updating event status:', error);
		}
	}

	async function handleEventFormSubmit(submittedData: any) {
		// Renamed for clarity
		try {
			if (isNewEvent) {
				// Create new event logic
				const newEventId = await eventStore.addEvent(submittedData);
				// Navigate to the newly created event's page
				window.location.href = `/events/${newEventId}`;
			} else if (event) {
				// Update existing event logic
				await eventStore.updateEvent(event.id, submittedData);
				showEditModal = false;
			}
		} catch (error) {
			console.error('Error saving event:', error);
			// Handle error (e.g., show a notification)
		}
	}

	async function handleNotesUpdate(notes: string) {
		if (!event || isNewEvent) return; // Don't update notes if new
		await eventStore.updateEvent(event.id, { notes });
		showEditNotesModal = false;
	}

	// Update notesForEditing when the modal opens
	$: if (event && showEditNotesModal) {
		notesForEditing = event.notes || '';
	}
</script>

<svelte:head>
	<title>{event?.name || 'Event Details'} | CircusSync</title>
</svelte:head>

{#if loading}
	<div class="flex justify-center items-center h-64">
		<LoadingSpinner size="lg" />
	</div>
{:else if !event && !isNewEvent}
	<!-- Modify condition to account for isNewEvent -->
	<div class="p-6 text-center">
		<h1 class="text-2xl font-bold text-red-600 mb-2">Event Not Found</h1>
		<p class="text-gray-600 mb-4">
			The event you're looking for doesn't exist or you don't have permission to view it.
		</p>
		<Button href="/events">Back to Events</Button>
	</div>
{:else}
	<!-- Event Header: Conditionally render or pass isNewEvent -->
	{#if !isNewEvent && event}
		<EventHeader
			{event}
			{canEdit}
			on:edit={() => (showEditModal = true)}
			on:delete={() => (showDeleteConfirm = true)}
			on:statusChange={(e) => handleStatusChange(e.detail)}
		/>
	{:else if isNewEvent}
		<!-- Optionally show a different header or title for new events -->
		<h1 class="text-2xl font-bold mb-4">Create New Event</h1>
	{/if}

	<!-- Tabs Navigation: Conditionally render or adjust based on isNewEvent -->
	{#if !isNewEvent && event}
		<EventTabs {activeTab} on:tabChange={(e) => (activeTab = e.detail)} />
	{/if}

	<!-- Main Content Area: Render form directly for new event, or tabs for existing -->
	{#if isNewEvent}
		<!-- Render EventForm directly for creating a new event -->
		<!-- Assuming EventForm can handle a null 'event' prop for creation -->
		<div class="mt-6">
			<EventForm
				event={null}
				on:submit={(e) => handleEventFormSubmit(e.detail)}
				submitLabel="Create Event"
				showCancelButton={true}
				on:cancel={() => window.history.back()}
			/>
		</div>
	{:else if event}
		<!-- Tab Content for existing event -->
		<div class="mt-6">
			<!-- ... existing tab content based on activeTab ... -->
			{#if activeTab === 'details'}
				<!-- DetailsTab might need event prop -->
			{:else if activeTab === 'client'}
				<!-- ClientInfoTab might need client prop -->
			{:else if activeTab === 'performers'}
				<!-- PerformersTab might need eventPerformers prop -->
			{:else if activeTab === 'contract'}
				<!-- ContractTab might need event prop -->
			{:else if activeTab === 'notes'}
				<!-- NotesTab might need event and canEdit props -->
			{/if}
		</div>
	{/if}

	<!-- Modals: Ensure they handle the context (new vs. edit) if necessary -->
	{#if showEditModal && event && !isNewEvent}
		<!-- EditEventModal needs event prop -->
	{/if}
	{#if showDeleteConfirm && event && !isNewEvent}
		<!-- DeleteConfirmModal needs event prop -->
	{/if}
	{#if showEditNotesModal && event && !isNewEvent}
		<!-- EditNotesModal needs notesForEditing prop -->
	{/if}
{/if}
