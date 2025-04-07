<script lang="ts">
	import { onMount } from 'svelte';
	import { format, formatDistanceToNow } from 'date-fns';
	import Icon from '$lib/components/ui/Icon.svelte';

	// Define the structure for an activity item
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

	// State variables
	let activityItems: ActivityItem[] = [];
	let loading = true;

	// Fetch recent activity data when the component mounts
	onMount(async () => {
		// In a real app, this would fetch from a database or API
		// Simulate fetching recent activity with a delay
		await new Promise((resolve) => setTimeout(resolve, 500));

		// Mock data for demonstration
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

	// Function to determine the appropriate icon based on activity type
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
				return 'activity'; // Default icon
		}
	}

	// Function to generate a descriptive string for the activity
	function getActivityDescription(item: ActivityItem): string {
		const action = item.action;
		const type = item.type;

		// Generate descriptive text based on type and action
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
				return `${action} ${type} "${item.entityName}"`; // Fallback description
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
	<ul class="divide-y divide-gray-200">
		{#each activityItems as item (item.id)}
			<li class="py-3">
				<div class="flex">
					<div class="mr-3 mt-1 flex-shrink-0">
						<div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
							<Icon name={getIconForActivityType(item.type)} size={16} extraClass="text-blue-600" />
						</div>
					</div>

					<div>
						<p>
							<span class="font-medium">{item.user.name}</span>
							<span class="text-gray-600"> {getActivityDescription(item)}</span>
						</p>

						<p class="text-sm text-gray-500 mt-1" title={format(item.timestamp, 'PPpp')}>
							{formatDistanceToNow(item.timestamp, { addSuffix: true })}
						</p>
					</div>
				</div>
			</li>
		{/each}
	</ul>
{/if}
