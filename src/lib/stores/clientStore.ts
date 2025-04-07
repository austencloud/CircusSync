// src/lib/stores/clientStore.ts
import { writable, derived } from 'svelte/store';
import type { Client } from '../types';
// Import db_service conditionally or handle its potential null value
import { db_service } from '../services/database'; // Assuming named export is working now
import { browser } from '$app/environment';

// --- MOCK FLAG & DATA ---
const useMockData = browser && import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Keep mock data in memory within the store instance
let memoryMockClients: Client[] = [
	{
		id: 'mock-client-1',
		name: 'Pritzker Elementary',
		contactPerson: 'Principal Jones',
		email: 'pjones@example.com',
		phone: '555-1111',
		address: '123 School St, Chicago',
		eventTypes: ['School Event', 'Festival'],
		servicesUsed: ['Balloon Art', 'Juggling'],
		lastPerformed: new Date(2023, 8, 15),
		lastContacted: new Date(2024, 6, 5),
		nextFollowUp: { date: new Date(2024, 7, 1), task: 'Confirm details for Back To School Bash' },
		notes: 'Loves the balloon dog act.',
		status: 'active',
		events: ['event1'],
		createdAt: new Date(2023, 1, 1),
		updatedAt: new Date(2024, 6, 5)
	},
	{
		id: 'mock-client-2',
		name: 'Agudath Jacob Synagogue',
		contactPerson: 'Rabbi Cohen',
		email: 'rcohen@example.com',
		phone: '555-2222',
		address: '456 Temple Rd, Chicago',
		eventTypes: ['Holiday Event', 'Religious Event'],
		servicesUsed: ['Fire Performance', 'LED Performance'],
		lastPerformed: new Date(2023, 11, 10),
		lastContacted: new Date(2024, 6, 1),
		nextFollowUp: { date: new Date(2024, 6, 14), task: 'Discuss Hannukah event details' },
		notes: 'Needs fire safety plan approval.',
		status: 'yearly',
		events: [],
		createdAt: new Date(2022, 5, 1),
		updatedAt: new Date(2024, 6, 1)
	},
	{
		id: 'mock-client-3',
		name: 'Schwab Rehab Hospital',
		contactPerson: 'Activity Director',
		email: 'activities@example.com',
		phone: '555-3333',
		address: '789 Health Ave, Chicago',
		eventTypes: ['Corporate Event'],
		servicesUsed: ['Ambient Entertainment', 'Magic'],
		lastPerformed: null,
		lastContacted: new Date(2024, 5, 25),
		nextFollowUp: { date: null, task: '' }, // No specific follow-up yet
		notes: 'Initial inquiry for Sept 18th event.',
		status: 'lead',
		events: [],
		createdAt: new Date(2024, 5, 25),
		updatedAt: new Date(2024, 5, 25)
	}
];
// --- END MOCK FLAG & DATA ---

function createClientStore() {
	const { subscribe, set, update } = writable<{
		clients: Client[];
		selectedClient: Client | null;
		loading: boolean;
		error: string | null;
	}>({
		clients: useMockData ? memoryMockClients : [], // Initialize with mock data if flag is set
		selectedClient: null,
		loading: !useMockData, // Don't show loading initially if using mock data
		error: null
	});

	// Helper to simulate DB delay
	const simulateDelay = () => new Promise((res) => setTimeout(res, 300));

	return {
		subscribe,

		async loadClients() {
			if (useMockData) {
				console.warn('Mock loadClients');
				update((state) => ({ ...state, clients: memoryMockClients, loading: false, error: null }));
				return;
			}
			// Real Firebase logic
			update((state) => ({ ...state, loading: true, error: null }));
			try {
				const clients = await db_service.client.getAll();
				update((state) => ({ ...state, clients, loading: false }));
			} catch (error) {
				console.error('Error loading clients:', error);
				update((state) => ({ ...state, loading: false, error: 'Failed to load clients' }));
			}
		},

		async loadClient(id: string) {
			if (useMockData) {
				console.warn(`Mock loadClient: ${id}`);
				await simulateDelay();
				const client = memoryMockClients.find((c) => c.id === id) || null;
				if (client) {
					update((state) => ({ ...state, selectedClient: client, loading: false, error: null }));
				} else {
					update((state) => ({
						...state,
						selectedClient: null,
						loading: false,
						error: 'Mock client not found'
					}));
				}
				return;
			}
			// Real Firebase logic
			update((state) => ({ ...state, loading: true, error: null }));
			try {
				const client = await db_service.client.get(id);
				update((state) => ({
					...state,
					selectedClient: client,
					loading: false,
					error: client ? null : 'Client not found'
				}));
			} catch (error) {
				console.error(`Error loading client ${id}:`, error);
				update((state) => ({ ...state, loading: false, error: 'Failed to load client' }));
			}
		},

		async addClient(
			clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>
		): Promise<string | null> {
			if (useMockData) {
				console.warn('Mock addClient:', clientData.name);
				await simulateDelay();
				const newId = `mock-client-${Date.now()}`;
				const newClient: Client = {
					...clientData,
					id: newId,
					createdAt: new Date(),
					updatedAt: new Date(),
					// Ensure optional fields are handled if not provided in clientData
					events: clientData.events || [],
					lastPerformed: clientData.lastPerformed || null,
					lastContacted: clientData.lastContacted || null,
					nextFollowUp: clientData.nextFollowUp || { date: null, task: '' }
				};
				memoryMockClients.push(newClient);
				update((state) => ({
					...state,
					clients: [...memoryMockClients], // Update with new list
					selectedClient: newClient,
					loading: false
				}));
				return newId;
			}
			// Real Firebase logic
			update((state) => ({ ...state, loading: true, error: null }));
			try {
				const id = await db_service.client.add(clientData);
				const newClient = await db_service.client.get(id);
				if (newClient) {
					update((state) => ({
						...state,
						clients: [...state.clients, newClient],
						selectedClient: newClient,
						loading: false
					}));
					return id;
				} else {
					throw new Error('Failed to fetch newly added client.');
				}
			} catch (error) {
				console.error('Error adding client:', error);
				update((state) => ({ ...state, loading: false, error: 'Failed to add client' }));
				return null;
			}
		},

		async updateClient(id: string, updates: Partial<Client>) {
			if (useMockData) {
				console.warn(`Mock updateClient: ${id}`, updates);
				await simulateDelay();
				const index = memoryMockClients.findIndex((c) => c.id === id);
				if (index !== -1) {
					memoryMockClients[index] = {
						...memoryMockClients[index],
						...updates,
						updatedAt: new Date()
					};
					const updatedClient = memoryMockClients[index];
					update((state) => ({
						...state,
						clients: [...memoryMockClients],
						selectedClient: state.selectedClient?.id === id ? updatedClient : state.selectedClient,
						loading: false
					}));
				} else {
					update((state) => ({
						...state,
						loading: false,
						error: 'Mock client not found for update'
					}));
				}
				return;
			}
			// Real Firebase logic
			// ... (keep existing Firebase update logic) ...
			update((state) => ({ ...state, loading: true, error: null }));
			try {
				await db_service.client.update(id, updates);
				const updatedClient = await db_service.client.get(id);
				if (updatedClient) {
					update((state) => ({
						...state,
						clients: state.clients.map((c) => (c.id === id ? updatedClient : c)),
						selectedClient: state.selectedClient?.id === id ? updatedClient : state.selectedClient,
						loading: false
					}));
				} else {
					await this.loadClients();
					update((state) => ({
						...state,
						loading: false,
						error: 'Client data may be inconsistent after update.'
					}));
				}
			} catch (error) {
				console.error(`Error updating client ${id}:`, error);
				update((state) => ({ ...state, loading: false, error: 'Failed to update client' }));
			}
		},

		async deleteClient(id: string) {
			if (useMockData) {
				console.warn(`Mock deleteClient: ${id}`);
				await simulateDelay();
				memoryMockClients = memoryMockClients.filter((c) => c.id !== id);
				update((state) => ({
					...state,
					clients: [...memoryMockClients],
					selectedClient: state.selectedClient?.id === id ? null : state.selectedClient,
					loading: false
				}));
				return;
			}
			// Real Firebase logic
			// ... (keep existing Firebase delete logic) ...
			update((state) => ({ ...state, loading: true, error: null }));
			try {
				await db_service.client.delete(id);
				update((state) => ({
					...state,
					clients: state.clients.filter((c) => c.id !== id),
					selectedClient: state.selectedClient?.id === id ? null : state.selectedClient,
					loading: false
				}));
			} catch (error) {
				console.error(`Error deleting client ${id}:`, error);
				update((state) => ({ ...state, loading: false, error: 'Failed to delete client' }));
			}
		},

		// --- Other methods need mock implementation too ---
		async loadClientsByStatus(status: Client['status']) {
			if (useMockData) {
				console.warn(`Mock loadClientsByStatus: ${status}`);
				const filtered = memoryMockClients.filter((c) => c.status === status);
				update((state) => ({ ...state, clients: filtered, loading: false, error: null }));
				return;
			}
			// Real Firebase logic
			// ... (keep existing Firebase logic) ...
		},

		async loadFollowUpClients(days: number = 7) {
			if (useMockData) {
				console.warn(`Mock loadFollowUpClients`);
				const today = new Date();
				const futureDate = new Date();
				today.setHours(0, 0, 0, 0);
				futureDate.setDate(today.getDate() + days);
				futureDate.setHours(23, 59, 59, 999);
				const filtered = memoryMockClients.filter(
					(c) =>
						c.nextFollowUp?.date &&
						c.nextFollowUp.date >= today &&
						c.nextFollowUp.date <= futureDate
				);
				update((state) => ({ ...state, clients: filtered, loading: false, error: null }));
				return;
			}
			// Real Firebase logic
			// ... (keep existing Firebase logic) ...
		},

		async searchClients(searchTerm: string) {
			if (useMockData) {
				console.warn(`Mock searchClients: ${searchTerm}`);
				if (!searchTerm.trim()) {
					update((state) => ({ ...state, clients: memoryMockClients, loading: false }));
					return;
				}
				const searchTermLower = searchTerm.toLowerCase();
				const filtered = memoryMockClients.filter(
					(client) =>
						(client.name && client.name.toLowerCase().includes(searchTermLower)) ||
						(client.contactPerson &&
							client.contactPerson.toLowerCase().includes(searchTermLower)) ||
						(client.email && client.email.toLowerCase().includes(searchTermLower))
				);
				update((state) => ({ ...state, clients: filtered, loading: false }));
				return;
			}
			// Real Firebase logic
			// ... (keep existing Firebase logic) ...
		},

		// --- Utility methods ---
		clearSelectedClient() {
			update((state) => ({ ...state, selectedClient: null }));
		},
		clearError() {
			update((state) => ({ ...state, error: null }));
		}
	};
}

export const clientStore = createClientStore();
export const clients = derived(clientStore, ($clientStore) => $clientStore.clients);
export const selectedClient = derived(clientStore, ($clientStore) => $clientStore.selectedClient);
export const loading = derived(clientStore, ($clientStore) => $clientStore.loading);
export const error = derived(clientStore, ($clientStore) => $clientStore.error);
