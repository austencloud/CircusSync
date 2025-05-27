<!-- src/routes/events/[id]/components/EventHeader.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { format } from 'date-fns';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';

	export let event: any;
	export let canEdit: boolean = false;

	const dispatch = createEventDispatcher();

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
				return status.charAt(0).toUpperCase() + status.slice(1);
		}
	}

	function handleEdit() {
		dispatch('edit');
	}

	function handleDelete() {
		dispatch('delete');
	}

	function handleStatusChange(newStatus: string) {
		dispatch('statusChange', newStatus);
	}
</script>

<div class="bg-white border-b">
	<div class="max-w-7xl mx-auto p-4 md:p-6">
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
			<!-- Event Title and Basic Info -->
			<div>
				<div class="flex items-center gap-2">
					<h1 class="text-2xl font-bold">{event.name}</h1>
					<Badge color={getStatusColor(event.status)}>{getStatusText(event.status)}</Badge>
				</div>
				<div class="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
					<div class="flex items-center">
						<Icon name="calendar" size={16} extraClass="mr-1" />
						{format(event.date, 'EEEE, MMMM d, yyyy')}
					</div>

					<div class="flex items-center">
						<Icon name="clock" size={16} extraClass="mr-1" />
						Performance: {event.performanceTime.start} - {event.performanceTime.end}
					</div>
					<div class="flex items-center">
						<Icon name="users" size={16} extraClass="mr-1" />
						{event.performers?.length || 0} performer{(event.performers?.length || 0) !== 1
							? 's'
							: ''}
					</div>
				</div>
			</div>

			<!-- Action Buttons -->
			{#if canEdit}
				<div class="flex flex-wrap gap-2">
					<Button variant="outline" on:click={handleEdit}>
						<Icon name="edit" size={16} extraClass="mr-1" />
						Edit Event
					</Button>

					<Button variant="outline" color="red" on:click={handleDelete}>
						<Icon name="trash-2" size={16} extraClass="mr-1" />
						Delete
					</Button>
					<div class="relative group">
						<Button>
							<Icon name="more-horizontal" size={16} />
							Actions
						</Button>
						<div
							class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block"
						>
							<div class="py-1">
								{#if event.status !== 'confirmed'}
									<button
										class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
										on:click={() => handleStatusChange('confirmed')}
									>
										Mark as Confirmed
									</button>
								{/if}
								{#if event.status !== 'deposit-received' && event.deposit.required && !event.deposit.received}
									<button
										class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
										on:click={() => handleStatusChange('deposit-received')}
									>
										Mark Deposit Received
									</button>
								{/if}
								{#if event.status !== 'completed'}
									<button
										class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
										on:click={() => handleStatusChange('completed')}
									>
										Mark as Completed
									</button>
								{/if}
								{#if event.status !== 'cancelled'}
									<button
										class="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
										on:click={() => handleStatusChange('cancelled')}
									>
										Mark as Cancelled
									</button>
								{/if}

								<a
									href={`/events/${event.id}/contract`}
									class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
								>
									Generate Contract
								</a>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
