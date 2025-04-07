// src/lib/stores/taskStore.ts
import { writable, derived } from 'svelte/store';
import type { Task } from '../types';
import { db_service } from '../services/database';

function createTaskStore() {
	const { subscribe, set, update } = writable<{
		tasks: Task[];
		selectedTask: Task | null;
		loading: boolean;
		error: string | null;
	}>({
		tasks: [],
		selectedTask: null,
		loading: false,
		error: null
	});

	return {
		subscribe,

		async loadTasks() {
			update((state) => ({ ...state, loading: true, error: null }));
			try {
				const tasks = await db_service.task.getAll();
				update((state) => ({ ...state, tasks, loading: false }));
			} catch (error) {
				console.error('Error loading tasks:', error);
				update((state) => ({ ...state, loading: false, error: 'Failed to load tasks' }));
			}
		},

		async loadTask(id: string) {
			update((state) => ({ ...state, loading: true, error: null }));
			try {
				const task = await db_service.task.get(id);
				if (!task) throw new Error('Task not found');
				update((state) => ({ ...state, selectedTask: task, loading: false }));
			} catch (error) {
				console.error(`Error loading task ${id}:`, error);
				update((state) => ({ ...state, loading: false, error: 'Failed to load task' }));
			}
		},

		async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
			update((state) => ({ ...state, loading: true, error: null }));
			try {
				const id = await db_service.task.add(task);
				const newTask = await db_service.task.get(id);
				update((state) => ({
					...state,
					tasks: [...state.tasks, newTask as Task],
					loading: false
				}));
				return id;
			} catch (error) {
				console.error('Error adding task:', error);
				update((state) => ({ ...state, loading: false, error: 'Failed to add task' }));
				throw error;
			}
		},

		async updateTask(id: string, updates: Partial<Task>) {
			// Optimistic update (optional)
			update((state) => {
				const taskIndex = state.tasks.findIndex((t) => t.id === id);
				if (taskIndex !== -1) {
					state.tasks[taskIndex] = { ...state.tasks[taskIndex], ...updates };
				}
				if (state.selectedTask?.id === id) {
					state.selectedTask = { ...state.selectedTask, ...updates };
				}
				return { ...state, loading: true, error: null }; // Still set loading for background update
			});

			try {
				await db_service.task.update(id, updates);
				// Fetch updated task to ensure consistency (or rely on Firestore listener if implemented)
				const updatedTask = await db_service.task.get(id);
				update((state) => ({
					...state,
					tasks: state.tasks.map((t) => (t.id === id ? (updatedTask as Task) : t)),
					selectedTask: state.selectedTask?.id === id ? updatedTask : state.selectedTask,
					loading: false // Set loading false after DB confirmation
				}));
			} catch (error) {
				console.error(`Error updating task ${id}:`, error);
				// Optionally revert optimistic update here if needed
				update((state) => ({ ...state, loading: false, error: 'Failed to update task' }));
				throw error;
			}
		},

		async deleteTask(id: string) {
			update((state) => ({ ...state, loading: true, error: null }));
			try {
				await db_service.task.delete(id);
				update((state) => ({
					...state,
					tasks: state.tasks.filter((t) => t.id !== id),
					selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
					loading: false
				}));
			} catch (error) {
				console.error(`Error deleting task ${id}:`, error);
				update((state) => ({ ...state, loading: false, error: 'Failed to delete task' }));
				throw error;
			}
		},

		async loadUserTasks(userId: string) {
			update((state) => ({ ...state, loading: true, error: null }));
			try {
				const tasks = await db_service.task.getByUser(userId);
				update((state) => ({ ...state, tasks, loading: false }));
			} catch (error) {
				console.error(`Error loading tasks for user ${userId}:`, error);
				update((state) => ({ ...state, loading: false, error: 'Failed to load user tasks' }));
			}
		},

		async loadUpcomingTasks(userId: string, days: number = 7) {
			update((state) => ({ ...state, loading: true, error: null }));
			try {
				const tasks = await db_service.task.getUpcoming(userId, days);
				update((state) => ({ ...state, tasks, loading: false }));
			} catch (error) {
				console.error(`Error loading upcoming tasks for user ${userId}:`, error);
				update((state) => ({ ...state, loading: false, error: 'Failed to load upcoming tasks' }));
			}
		},

		clearSelectedTask() {
			update((state) => ({ ...state, selectedTask: null }));
		},

		clearError() {
			update((state) => ({ ...state, error: null }));
		}
	};
}

export const taskStore = createTaskStore();

// Derived stores
export const tasks = derived(taskStore, ($taskStore) => $taskStore.tasks);
export const selectedTask = derived(taskStore, ($taskStore) => $taskStore.selectedTask);
export const loading = derived(taskStore, ($taskStore) => $taskStore.loading);
export const error = derived(taskStore, ($taskStore) => $taskStore.error);
