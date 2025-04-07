// src/lib/stores/performerStore.ts
import { writable, derived } from 'svelte/store';
import type { Performer, PerformerSkillCategory } from '../types';
import { db_service } from '../services/database';

// Create a writable store with initial state
function createPerformerStore() {
  const { subscribe, set, update } = writable<{
    performers: Performer[];
    selectedPerformer: Performer | null;
    loading: boolean;
    error: string | null;
  }>({
    performers: [],
    selectedPerformer: null,
    loading: false,
    error: null
  });

  return {
    subscribe,
    
    // Load all performers
    async loadPerformers() {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const performers = await db_service.performer.getAll();
        update(state => ({ ...state, performers, loading: false }));
      } catch (error) {
        console.error('Error loading performers:', error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: 'Failed to load performers' 
        }));
      }
    },
    
    // Load a single performer by ID
    async loadPerformer(id: string) {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const performer = await db_service.performer.get(id);
        
        if (!performer) {
          throw new Error('Performer not found');
        }
        
        update(state => ({ ...state, selectedPerformer: performer, loading: false }));
      } catch (error) {
        console.error(`Error loading performer ${id}:`, error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: 'Failed to load performer' 
        }));
      }
    },
    
    // Add a new performer
    async addPerformer(performer: Omit<Performer, 'id' | 'createdAt' | 'updatedAt'>) {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const id = await db_service.performer.add(performer);
        const newPerformer = await db_service.performer.get(id);
        
        update(state => ({
          ...state,
          performers: [...state.performers, newPerformer as Performer],
          selectedPerformer: newPerformer,
          loading: false
        }));
        
        return id;
      } catch (error) {
        console.error('Error adding performer:', error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: 'Failed to add performer' 
        }));
        throw error;
      }
    },
    
    // Update an existing performer
    async updatePerformer(id: string, updates: Partial<Performer>) {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        await db_service.performer.update(id, updates);
        const updatedPerformer = await db_service.performer.get(id);
        
        update(state => ({
          ...state,
          performers: state.performers.map(p => 
            p.id === id ? updatedPerformer as Performer : p
          ),
          selectedPerformer: state.selectedPerformer?.id === id 
            ? updatedPerformer 
            : state.selectedPerformer,
          loading: false
        }));
      } catch (error) {
        console.error(`Error updating performer ${id}:`, error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: 'Failed to update performer' 
        }));
        throw error;
      }
    },
    
    // Delete a performer
    async deletePerformer(id: string) {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        await db_service.performer.delete(id);
        
        update(state => ({
          ...state,
          performers: state.performers.filter(p => p.id !== id),
          selectedPerformer: state.selectedPerformer?.id === id 
            ? null 
            : state.selectedPerformer,
          loading: false
        }));
      } catch (error) {
        console.error(`Error deleting performer ${id}:`, error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: 'Failed to delete performer' 
        }));
        throw error;
      }
    },
    
    // Load performers by skill category
    async loadPerformersBySkill(category: PerformerSkillCategory) {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const performers = await db_service.performer.getBySkill(category);
        update(state => ({ ...state, performers, loading: false }));
      } catch (error) {
        console.error(`Error loading performers with skill ${category}:`, error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: `Failed to load ${category} performers` 
        }));
      }
    },
    
    // Load performers available on a specific date
    async loadAvailablePerformers(date: Date) {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const performers = await db_service.performer.getAvailableForDate(date);
        update(state => ({ ...state, performers, loading: false }));
      } catch (error) {
        console.error(`Error loading available performers for ${date}:`, error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: 'Failed to load available performers' 
        }));
      }
    },
    
    // Update performer availability
    async updateAvailability(
      performerId: string, 
      date: Date, 
      status: 'available' | 'unavailable' | 'tentative',
      notes?: string
    ) {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const performer = await db_service.performer.get(performerId);
        
        if (!performer) throw new Error('Performer not found');
        
        const availability = [...(performer.availability || [])];
        
        // Find if we already have an entry for this date
        const dateString = date.toDateString();
        const existingIndex = availability.findIndex(
          a => a.date.toDateString() === dateString
        );
        
        if (existingIndex >= 0) {
          // Update existing entry
          availability[existingIndex] = {
            ...availability[existingIndex],
            status,
            notes
          };
        } else {
          // Add new entry
          availability.push({ date, status, notes });
        }
        
        // Update the performer
        await this.updatePerformer(performerId, { availability });
      } catch (error) {
        console.error(`Error updating availability for ${performerId}:`, error);
        update(state => ({ 
          ...state, 
          loading: false, 
          error: 'Failed to update availability' 
        }));
        throw error;
      }
    },
    
    // Clear selected performer
    clearSelectedPerformer() {
      update(state => ({ ...state, selectedPerformer: null }));
    },
    
    // Reset error state
    clearError() {
      update(state => ({ ...state, error: null }));
    }
  };
}

// Create the store
export const performerStore = createPerformerStore();

// Derived stores for specific data
export const performers = derived(
  performerStore,
  $performerStore => $performerStore.performers
);

export const selectedPerformer = derived(
  performerStore,
  $performerStore => $performerStore.selectedPerformer
);

export const loading = derived(
  performerStore,
  $performerStore => $performerStore.loading
);

export const error = derived(
  performerStore,
  $performerStore => $performerStore.error
);

// Helpers for filtering performers by skill
export function getPerformersBySkill(allPerformers: Performer[], skill: PerformerSkillCategory) {
  return allPerformers.filter(performer => 
    performer.skills.some(s => s.category === skill)
  );
}