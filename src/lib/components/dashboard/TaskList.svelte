<script lang="ts">
  import { format } from 'date-fns';
  import { fade } from 'svelte/transition';
  import type { Task } from '$lib/types';
  import Icon from '$lib/components/ui/Icon.svelte';
  import { taskStore } from '$lib/stores/taskStore';

  export let tasks: Task[] = [];
  let loading = false;

  // Sort tasks by priority and due date
  $: sortedTasks = [...tasks].sort((a, b) => {
    // First sort by completion
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    // Then by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (a.priority !== b.priority) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }

    // Finally by due date
    // Handle potential null or invalid dates defensively
    const dateA = a.dueDate instanceof Date ? a.dueDate.getTime() : 0;
    const dateB = b.dueDate instanceof Date ? b.dueDate.getTime() : 0;
    return dateA - dateB;
  });

  function getPriorityColor(priority: Task['priority']): string {
    switch(priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  async function toggleTaskComplete(taskId: string, currentStatus: boolean) {
    loading = true;
    try {
      await taskStore.updateTask(taskId, { completed: !currentStatus });
      // Optionally refetch tasks or rely on store reactivity if implemented
    } catch (error) {
      console.error('Error updating task:', error);
      // Optionally revert UI state if update fails
    } finally {
      loading = false;
    }
  }

  function isOverdue(task: Task): boolean {
    if (task.completed || !(task.dueDate instanceof Date)) return false;
    return new Date() > task.dueDate;
  }

  // Helper function to get icon name based on relatedTo type
  function getRelatedIcon(type: string | undefined): string {
      switch (type) {
          case 'client': return 'user';
          case 'event': return 'calendar';
          case 'performer': return 'star';
          case 'agent': return 'briefcase'; // Assuming 'agent' is a possibility
          default: return 'link'; // Default icon
      }
  }
</script>

{#if tasks.length === 0}
  <div class="py-4 text-center text-gray-500">
    <p>No tasks found</p>
  </div>
{:else}
  <ul class="space-y-2">
    {#each sortedTasks as task (task.id)}
      <li
        transition:fade
        class="p-3 border rounded-md {task.completed ? 'bg-gray-50 border-gray-200' : (isOverdue(task) ? 'border-red-200 bg-red-50' : 'border-gray-200')}"
      >
        <div class="flex items-start gap-3">
          <div class="mt-1">
            <button
              class="h-5 w-5 rounded-full border border-gray-300 flex items-center justify-center {task.completed ? 'bg-green-500 border-green-500' : ''}"
              aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
              disabled={loading}
              on:click={() => toggleTaskComplete(task.id, task.completed)}
            >
              {#if task.completed}
                <Icon name="check" size={12} extraClass="text-white" />
              {/if}
            </button>
          </div>

          <div class="flex-1">
            <div class="flex justify-between">
              <p class="font-medium {task.completed ? 'line-through text-gray-500' : ''}">
                {task.title}
              </p>

              <span class="inline-block px-2 py-0.5 text-xs rounded-full {getPriorityColor(task.priority)}">
                {task.priority}
              </span>
            </div>

            {#if task.description}
              <p class="text-sm text-gray-600 mt-1 {task.completed ? 'line-through text-gray-400' : ''}">
                {task.description}
              </p>
            {/if}

            <div class="flex items-center mt-2 text-xs text-gray-500">
              <Icon name="calendar" size={12} extraClass="mr-1" />
              {#if task.dueDate instanceof Date}
                <span class={isOverdue(task) && !task.completed ? 'text-red-600 font-medium' : ''}>
                  Due: {format(task.dueDate, 'MMM d, yyyy')}
                </span>
              {:else}
                 <span>No due date</span>
              {/if}

              {#if task.relatedTo}
                <span class="ml-3 flex items-center">
                  <Icon
                    name={getRelatedIcon(task.relatedTo.type)}
                    size={12}
                    extraClass="mr-1"
                  />
                  {task.relatedTo.type}
                </span>
              {/if}
            </div>
          </div>
        </div>
      </li>
    {/each}
  </ul>
{/if}

<div class="mt-3 text-right">
  <a href="/tasks" class="text-blue-600 hover:underline text-sm font-medium flex items-center justify-end">
    View all tasks
    <Icon name="arrow-right" size={16} extraClass="ml-1" />
  </a>
</div>

