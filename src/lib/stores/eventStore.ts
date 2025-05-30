// src/lib/stores/eventStore.ts
import { writable, derived } from 'svelte/store';
import type { Event, Performer, EventStatus } from '../types';
import { db_service } from '../services/database';
import { performerStore } from './performerStore'; // To get performer details

// Helper function to get performer details for an event
async function getPerformersWithDetails(event: Event): Promise<Performer[]> {
	const performerIds = event.performers.map((p) => p.performer);
	if (performerIds.length === 0) return [];

	// Ensure performers are loaded in the performerStore (or load them if needed)
	// This assumes performerStore might already have them or can fetch them.
	// For simplicity, we'll try fetching them directly if not found, but a better approach
	// might involve a shared cache or ensuring performerStore is loaded first.

	// For now, we'll fetch performers directly from the database
	let fetchedPerformers: Performer[] = [];

	// Fetch all needed performers directly
	const performerPromises = await Promise.all(
		performerIds.map(async (id) => {
			try {
				return await db_service.performer.get(id);
			} catch (error) {
				console.error(`Error fetching performer ${id}:`, error);
				return null;
			}
		})
	);
	fetchedPerformers = performerPromises.filter((p): p is Performer => p !== null);

	// Return performers in the order they appear in the event
	return performerIds
		.map((id) => fetchedPerformers.find((p) => p.id === id))
		.filter((p): p is Performer => p !== undefined);
}

function createEventStore() {
	// Svelte 4 writable store
	const { subscribe, set, update } = writable<{
		events: Event[];
		selectedEvent: Event | null;
		eventPerformers: Performer[];
		loading: boolean;
		error: string | null;
	}>({
		events: [],
		selectedEvent: null,
		eventPerformers: [],
		loading: false,
		error: null
	});

	return {
		subscribe,

		async loadEvents() {
			update((state) => ({ ...state, loading: true, error: null }));
			try {
				const events = await db_service.event.getAll();
				update((state) => ({ ...state, events, loading: false }));
			} catch (error) {
				console.error('Error loading events:', error);
				update((state) => ({ ...state, loading: false, error: 'Failed to load events' }));
			}
		},

		async loadEvent(id: string) {
			update((state) => ({
				...state,
				loading: true,
				error: null,
				selectedEvent: null,
				eventPerformers: []
			}));
			try {
				const event = await db_service.event.get(id);
				if (!event) throw new Error('Event not found');

				// Fetch performers associated with this event
				const performers = await getPerformersWithDetails(event);

				update((state) => ({
					...state,
					selectedEvent: event,
					eventPerformers: performers,
					loading: false
				}));
			} catch (error) {
				console.error(`Error loading event ${id}:`, error);
				update((state) => ({ ...state, loading: false, error: 'Failed to load event' }));
			}
		},

		// Load performers *after* event is selected
		async loadPerformersForEvent(eventId: string) {
			update((state) => ({ ...state, loading: true, error: null }));
			try {
				let currentEvent: Event | null = null;
				const unsubscribe = subscribe((store) => (currentEvent = store.selectedEvent));
				unsubscribe(); // Get current selected event

				if (!currentEvent || (currentEvent && currentEvent.id !== eventId)) {
					currentEvent = await db_service.event.get(eventId);
					if (!currentEvent) throw new Error('Event not found for performer loading');
				}

				const performers = await getPerformersWithDetails(currentEvent);
				update((state) => ({ ...state, eventPerformers: performers, loading: false }));
			} catch (error) {
				console.error(`Error loading performers for event ${eventId}:`, error);
				update((state) => ({ ...state, loading: false, error: 'Failed to load event performers' }));
			}
		},

		async addEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
			update((state) => ({ ...state, loading: true, error: null }));
			try {
				const id = await db_service.event.add(event);
				const newEvent = await db_service.event.get(id);
				update((state) => ({
					...state,
					events: [...state.events, newEvent as Event],
					selectedEvent: newEvent, // Optionally select the new event
					eventPerformers: [], // Clear performers for new event initially
					loading: false
				}));
				if (newEvent) await this.loadPerformersForEvent(newEvent.id); // Load performers after adding
				return id;
			} catch (error) {
				console.error('Error adding event:', error);
				update((state) => ({ ...state, loading: false, error: 'Failed to add event' }));
				throw error;
			}
		},

		async updateEvent(id: string, updates: Partial<Event>) {
			update((state) => ({ ...state, loading: true, error: null }));
			try {
				await db_service.event.update(id, updates);
				const updatedEvent = await db_service.event.get(id);
				let performers: Performer[] = [];
				if (updatedEvent) {
					performers = await getPerformersWithDetails(updatedEvent);
				}

				update((state) => ({
					...state,
					events: state.events.map((e) => (e.id === id ? (updatedEvent as Event) : e)),
					selectedEvent: state.selectedEvent?.id === id ? updatedEvent : state.selectedEvent,
					eventPerformers: state.selectedEvent?.id === id ? performers : state.eventPerformers,
					loading: false
				}));
			} catch (error) {
				console.error(`Error updating event ${id}:`, error);
				update((state) => ({ ...state, loading: false, error: 'Failed to update event' }));
				throw error;
			}
		},

		async deleteEvent(id: string) {
			update((state) => ({ ...state, loading: true, error: null }));
			try {
				await db_service.event.delete(id);
				update((state) => ({
					...state,
					events: state.events.filter((e) => e.id !== id),
					selectedEvent: state.selectedEvent?.id === id ? null : state.selectedEvent,
					eventPerformers: state.selectedEvent?.id === id ? [] : state.eventPerformers,
					loading: false
				}));
			} catch (error) {
				console.error(`Error deleting event ${id}:`, error);
				update((state) => ({ ...state, loading: false, error: 'Failed to delete event' }));
				throw error;
			}
		},

		async loadUpcomingEvents(limit: number = 10) {
			update((state) => ({ ...state, loading: true, error: null }));
			try {
				const events = await db_service.event.getUpcoming(limit);
				// Set only upcoming events, or merge based on desired behavior
				update((state) => ({ ...state, events, loading: false }));
			} catch (error) {
				console.error('Error loading upcoming events:', error);
				update((state) => ({ ...state, loading: false, error: 'Failed to load upcoming events' }));
			}
		},

		async loadEventsByStatus(status: EventStatus) {
			update((state) => ({ ...state, loading: true, error: null }));
			try {
				const events = await db_service.event.getByStatus(status);
				update((state) => ({ ...state, events, loading: false }));
			} catch (error) {
				console.error(`Error loading events with status ${status}:`, error);
				update((state) => ({ ...state, loading: false, error: `Failed to load ${status} events` }));
			}
		},

		async loadClientEvents(clientId: string) {
			update((state) => ({ ...state, loading: true, error: null }));
			try {
				const events = await db_service.event.getByClient(clientId);
				update((state) => ({ ...state, events, loading: false }));
			} catch (error) {
				console.error(`Error loading events for client ${clientId}:`, error);
				update((state) => ({ ...state, loading: false, error: 'Failed to load client events' }));
			}
		},

		async loadPerformerEvents(performerId: string) {
			update((state) => ({ ...state, loading: true, error: null }));
			try {
				const events = await db_service.event.getByPerformer(performerId);
				// Note: This sets the main events list. Consider if a separate list is needed.
				update((state) => ({ ...state, events, loading: false }));
			} catch (error) {
				console.error(`Error loading events for performer ${performerId}:`, error);
				update((state) => ({ ...state, loading: false, error: 'Failed to load performer events' }));
			}
		},

		clearSelectedEvent() {
			update((state) => ({ ...state, selectedEvent: null, eventPerformers: [] }));
		},

		clearError() {
			update((state) => ({ ...state, error: null }));
		}
	};
}

export const eventStore = createEventStore();

// Derived stores
export const events = derived(eventStore, ($eventStore) => $eventStore.events);
export const selectedEvent = derived(eventStore, ($eventStore) => $eventStore.selectedEvent);
export const eventPerformers = derived(eventStore, ($eventStore) => $eventStore.eventPerformers);
export const loading = derived(eventStore, ($eventStore) => $eventStore.loading);
export const error = derived(eventStore, ($eventStore) => $eventStore.error);
