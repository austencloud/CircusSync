  <!-- src/lib/components/dashboard/TaskList.svelte -->
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
      return a.dueDate.getTime() - b.dueDate.getTime();
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
      } catch (error) {
        console.error('Error updating task:', error);
      } finally {
        loading = false;
      }
    }
    
    function isOverdue(task: Task): boolean {
      if (task.completed) return false;
      return new Date() > task.dueDate;
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
                  <Icon name="check" size={12} class="text-white" />
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
                <Icon name="calendar" size={12} class="mr-1" />
                <span class={isOverdue(task) && !task.completed ? 'text-red-600 font-medium' : ''}>
                  Due: {format(task.dueDate, 'MMM d, yyyy')}
                </span>
                
                {#if task.relatedTo}
                  <span class="ml-3 flex items-center">
                    <Icon 
                      name={task.relatedTo.type === 'client' ? 'user' : 
                             task.relatedTo.type === 'event' ? 'calendar' : 
                             task.relatedTo.type === 'performer' ? 'star' : 'briefcase'} 
                      size={12} 
                      class="mr-1" 
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
      <Icon name="arrow-right" size={16} class="ml-1" />
    </a>
  </div>
  
  <!-- src/lib/components/dashboard/RecentActivity.svelte -->
  <script lang="ts">
    import { onMount } from 'svelte';
    import { format, formatDistanceToNow } from 'date-fns';
    import Icon from '$lib/components/ui/Icon.svelte';
    
    interface ActivityItem {
      id: string;
      type: 'client' | 'event' | 'performer' | 'task' | 'contract' | 'payment';
      action: 'created' | 'updated' | 'completed' | 'cancelled' | 'sent' | 'received';
      entityId: string;
      entityName: string;
      timestamp: Date;
      user: {
        id: string;
        name: string;
      };
    }
    
    let activityItems: ActivityItem[] = [];
    let loading = true;
    
    // In a real app, this would fetch from a database
    onMount(async () => {
      // Simulate fetching recent activity
      await new Promise(resolve => setTimeout(resolve, 500));
      
      activityItems = [
        {
          id: '1',
          type: 'event',
          action: 'created',
          entityId: 'event1',
          entityName: 'Pritzker Elementary Back to School Bash',
          timestamp: new Date(2024, 6, 5), // July 5, 2024
          user: { id: 'user1', name: 'Austen Cloud' }
        },
        {
          id: '2',
          type: 'contract',
          action: 'sent',
          entityId: 'event2',
          entityName: 'YPO Yearly Celebration',
          timestamp: new Date(2024, 6, 2), // July 2, 2024
          user: { id: 'user1', name: 'Austen Cloud' }
        },
        {
          id: '3',
          type: 'payment',
          action: 'received',
          entityId: 'event2',
          entityName: 'YPO Yearly Celebration',
          timestamp: new Date(2024, 6, 1), // July 1, 2024
          user: { id: 'user1', name: 'Austen Cloud' }
        },
        {
          id: '4',
          type: 'client',
          action: 'created',
          entityId: 'client1',
          entityName: 'Schwab Rehab Hospital',
          timestamp: new Date(2024, 5, 25), // June 25, 2024
          user: { id: 'user1', name: 'Austen Cloud' }
        },
        {
          id: '5',
          type: 'task',
          action: 'completed',
          entityId: 'task1',
          entityName: 'Follow up with Agudath Jacob Synagogue',
          timestamp: new Date(2024, 5, 20), // June 20, 2024
          user: { id: 'user2', name: 'Robert Bershadsky' }
        }
      ];
      
      loading = false;
    });
    
    function getIconForActivityType(type: ActivityItem['type']): string {
      switch (type) {
        case 'client':
          return 'user';
        case 'event':
          return 'calendar';
        case 'performer':
          return 'star';
        case 'task':
          return 'check-square';
        case 'contract':
          return 'file-text';
        case 'payment':
          return 'dollar-sign';
        default:
          return 'activity';
      }
    }
    
    function getActivityDescription(item: ActivityItem): string {
      const action = item.action;
      const type = item.type;
      
      switch (`${type}-${action}`) {
        case 'event-created':
          return `created new event "${item.entityName}"`;
        case 'client-created':
          return `added new client "${item.entityName}"`;
        case 'performer-created':
          return `added new performer "${item.entityName}"`;
        case 'task-completed':
          return `completed task "${item.entityName}"`;
        case 'contract-sent':
          return `sent contract for "${item.entityName}"`;
        case 'payment-received':
          return `recorded payment for "${item.entityName}"`;
        case 'event-updated':
          return `updated event "${item.entityName}"`;
        case 'event-cancelled':
          return `cancelled event "${item.entityName}"`;
        default:
          return `${action} ${type} "${item.entityName}"`;
      }
    }
  </script>
  
  {#if loading}
    <div class="py-4 text-center text-gray-500">
      <p>Loading activity...</p>
    </div>
  {:else if activityItems.length === 0}
    <div class="py-4 text-center text-gray-500">
      <p>No recent activity found</p>
    </div>
  {:else}
    <ul class="divide-y">
      {#each activityItems as item}
        <li class="py-3">
          <div class="flex">
            <div class="mr-3 mt-1">
              <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Icon name={getIconForActivityType(item.type)} size={16} class="text-blue-600" />
              </div>
            </div>
            
            <div>
              <p>
                <span class="font-medium">{item.user.name}</span>
                <span class="text-gray-600"> {getActivityDescription(item)}</span>
              </p>
              
              <p class="text-sm text-gray-500 mt-1">
                {formatDistanceToNow(item.timestamp, { addSuffix: true })}
              </p>
            </div>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
