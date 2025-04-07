// src/lib/stores/clientStore.ts
import { writable, derived } from 'svelte/store';
import type { Client } from '../types';
import { db_service } from '../services/database';

// Create a writable store with initial state
function createClientStore() {
  const { subscribe, set, update } = writable<{
    clients: Client[];
    selectedClient: Client | null;
    loading: boolean;
    error: string | null;
  }>({
    clients: [],
    selectedClient: null,
    loading: false,
    error: null
  });

  return {
    subscribe,
    
    // Load all clients
    async loadClients() {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const clients = await db_service.client.getAll();
        update(state => ({ ...state, clients, loading: false }));
      } catch (error) {
        console.error('Error loading clients:', error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: 'Failed to load clients' 
        }));
      }
    },
    
    // Load a single client by ID
    async loadClient(id: string) {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const client = await db_service.client.get(id);
        
        if (!client) {
          throw new Error('Client not found');
        }
        
        update(state => ({ ...state, selectedClient: client, loading: false }));
      } catch (error) {
        console.error(`Error loading client ${id}:`, error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: 'Failed to load client' 
        }));
      }
    },
    
    // Add a new client
    async addClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const id = await db_service.client.add(client);
        const newClient = await db_service.client.get(id);
        
        update(state => ({
          ...state,
          clients: [...state.clients, newClient as Client],
          selectedClient: newClient,
          loading: false
        }));
        
        return id;
      } catch (error) {
        console.error('Error adding client:', error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: 'Failed to add client' 
        }));
        throw error;
      }
    },
    
    // Update an existing client
    async updateClient(id: string, updates: Partial<Client>) {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        await db_service.client.update(id, updates);
        const updatedClient = await db_service.client.get(id);
        
        update(state => ({
          ...state,
          clients: state.clients.map(c => c.id === id ? updatedClient as Client : c),
          selectedClient: state.selectedClient?.id === id ? updatedClient : state.selectedClient,
          loading: false
        }));
      } catch (error) {
        console.error(`Error updating client ${id}:`, error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: 'Failed to update client' 
        }));
        throw error;
      }
    },
    
    // Delete a client
    async deleteClient(id: string) {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        await db_service.client.delete(id);
        
        update(state => ({
          ...state,
          clients: state.clients.filter(c => c.id !== id),
          selectedClient: state.selectedClient?.id === id ? null : state.selectedClient,
          loading: false
        }));
      } catch (error) {
        console.error(`Error deleting client ${id}:`, error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: 'Failed to delete client' 
        }));
        throw error;
      }
    },
    
    // Load clients by status
    async loadClientsByStatus(status: Client['status']) {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const clients = await db_service.client.getByStatus(status);
        update(state => ({ ...state, clients, loading: false }));
      } catch (error) {
        console.error(`Error loading clients with status ${status}:`, error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: `Failed to load ${status} clients` 
        }));
      }
    },
    
    // Load clients that need follow-up
    async loadFollowUpClients(days: number = 7) {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const clients = await db_service.client.getForFollowUp(days);
        update(state => ({ ...state, clients, loading: false }));
      } catch (error) {
        console.error('Error loading follow-up clients:', error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: 'Failed to load follow-up clients' 
        }));
      }
    },
    
    // Search clients
    async searchClients(searchTerm: string) {
      if (!searchTerm.trim()) {
        return this.loadClients();
      }
      
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const clients = await db_service.client.search(searchTerm);
        update(state => ({ ...state, clients, loading: false }));
      } catch (error) {
        console.error(`Error searching clients for "${searchTerm}":`, error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: 'Search failed' 
        }));
      }
    },
    
    // Clear selected client
    clearSelectedClient() {
      update(state => ({ ...state, selectedClient: null }));
    },
    
    // Reset error state
    clearError() {
      update(state => ({ ...state, error: null }));
    }
  };
}

// Create the store
export const clientStore = createClientStore();

// Derived stores for specific data
export const clients = derived(
  clientStore,
  $clientStore => $clientStore.clients
);

export const selectedClient = derived(
  clientStore,
  $clientStore => $clientStore.selectedClient
);

export const loading = derived(
  clientStore,
  $clientStore => $clientStore.loading
);

export const error = derived(
  clientStore,
  $clientStore => $clientStore.error
);

