<!-- src/routes/events/[id]/components/tabs/DetailsTab.svelte -->
<script lang="ts">
	import { format } from 'date-fns';
	import Icon from '$lib/components/ui/Icon.svelte';

	export let event: any;
	export let eventPerformers: any[] = [];

	$: totalPay = eventPerformers.reduce((sum, p) => sum + (p.pay || 0), 0);
	$: profit = event?.payment.totalValue ? event.payment.totalValue - totalPay : 0;
</script>

<div class="grid md:grid-cols-2 gap-6">
	<!-- Event Details -->
	<div class="bg-white rounded-lg shadow p-4">
		<h2 class="text-lg font-semibold mb-4">Event Details</h2>

		<div class="space-y-4">
			<div>
				<h3 class="text-sm font-medium text-gray-500">Date & Time</h3>
				<div class="mt-1">
					<div class="flex items-center">
						<Icon name="calendar" size={16} extraClass="text-gray-400 mr-2" />
						<p>{format(event.date, 'EEEE, MMMM d, yyyy')}</p>
					</div>
					<div class="flex items-center mt-1">
						<Icon name="clock" size={16} extraClass="text-gray-400 mr-2" />
						<p>Performance: {event.performanceTime.start} - {event.performanceTime.end}</p>
					</div>
					{#if event.callTime}
						<div class="flex items-center mt-1">
							<Icon name="alert-circle" size={16} extraClass="text-gray-400 mr-2" />
							<p>Call Time: {event.callTime}</p>
						</div>
					{/if}
				</div>
			</div>

			<div>
				<h3 class="text-sm font-medium text-gray-500">Location</h3>
				<div class="mt-1">
					<div class="flex items-start">
						<Icon name="map-pin" size={16} extraClass="text-gray-400 mr-2 mt-1" />
						<p class="flex-1">{event.location.address}</p>
					</div>
					{#if event.location.notes}
						<div class="flex items-start mt-1">
							<Icon name="info" size={16} extraClass="text-gray-400 mr-2 mt-1" />
							<p class="flex-1">{event.location.notes}</p>
						</div>
					{/if}
					{#if event.location.mapLink}
						<div class="mt-2">
							<a
								href={event.location.mapLink}
								target="_blank"
								rel="noopener noreferrer"
								class="text-blue-600 hover:underline text-sm inline-flex items-center"
							>
								<Icon name="external-link" size={14} extraClass="mr-1" />
								Open in Maps
							</a>
						</div>
					{/if}
				</div>
			</div>

			<div>
				<h3 class="text-sm font-medium text-gray-500">Services</h3>
				<div class="mt-1 flex flex-wrap gap-1">
					{#each event.services as service}
						<span class="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
							{service}
						</span>
					{/each}
				</div>
			</div>

			<div>
				<h3 class="text-sm font-medium text-gray-500">Equipment & Costumes</h3>
				<div class="mt-1">
					{#if event.costume}
						<div class="flex items-start">
							<Icon name="shirt" size={16} extraClass="text-gray-400 mr-2 mt-1" />
							<p>Costume: {event.costume}</p>
						</div>
					{/if}
					{#if event.equipmentNeeded && event.equipmentNeeded.length > 0}
						<div class="flex items-start mt-2">
							<Icon name="package" size={16} extraClass="text-gray-400 mr-2 mt-1" />
							<div>
								<p class="font-medium">Equipment Needed:</p>
								<ul class="list-disc pl-5 mt-1 space-y-1">
									{#each event.equipmentNeeded as item}
										<li>{item}</li>
									{/each}
								</ul>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Client & Management Summary -->
	<div class="space-y-6">
		<div class="bg-white rounded-lg shadow p-4">
			<h2 class="text-lg font-semibold mb-4">Management Summary</h2>
			<div class="space-y-3">
				<div class="flex justify-between">
					<span class="text-gray-600">Client Liaison:</span>
					<span class="font-medium">{event.clientLiaison}</span>
				</div>

				<div class="flex justify-between">
					<span class="text-gray-600">Gig Manager:</span>
					<span class="font-medium">{event.gigManager}</span>
				</div>

				<div class="flex justify-between">
					<span class="text-gray-600">Created:</span>
					<span>{format(event.createdAt, 'MMM d, yyyy')}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-gray-600">Last Updated:</span>
					<span>{format(event.updatedAt, 'MMM d, yyyy')}</span>
				</div>
			</div>
		</div>

		<div class="bg-white rounded-lg shadow p-4">
			<h2 class="text-lg font-semibold mb-4">Financial Summary</h2>
			<div class="space-y-3">
				<div class="flex justify-between">
					<span class="text-gray-600">Event Value:</span>
					<span class="font-medium">${event.payment.totalValue.toFixed(2)}</span>
				</div>

				<div class="flex justify-between">
					<span class="text-gray-600">Performer Pay:</span>
					<span class="font-medium">${totalPay.toFixed(2)}</span>
				</div>
				<div class="flex justify-between border-t pt-2 mt-2">
					<span class="text-gray-700 font-medium">Profit:</span>
					<span class="font-bold text-green-700">${profit.toFixed(2)}</span>
				</div>
				{#if event.deposit.required}
					<div class="mt-4 pt-3 border-t">
						<div class="flex justify-between">
							<span class="text-gray-600">Deposit Required:</span>
							<span class="font-medium">${event.deposit.amount?.toFixed(2) || 'N/A'}</span>
						</div>
						<div class="flex justify-between mt-1">
							<span class="text-gray-600">Deposit Status:</span>
							<span
								class={event.deposit.received
									? 'text-green-600 font-medium'
									: 'text-amber-600 font-medium'}
							>
								{event.deposit.received ? 'Received' : 'Pending'}
							</span>
						</div>
						{#if event.deposit.received && event.deposit.receivedDate}
							<div class="flex justify-between mt-1">
								<span class="text-gray-600">Date Received:</span>
								<span>{format(event.deposit.receivedDate, 'MMM d, yyyy')}</span>
							</div>
						{/if}
					</div>
				{/if}
				<div class="mt-4 pt-3 border-t">
					<div class="flex justify-between">
						<span class="text-gray-600">Payment Status:</span>
						<span
							class={event.payment.paid
								? 'text-green-600 font-medium'
								: 'text-amber-600 font-medium'}
						>
							{event.payment.paid ? 'Paid' : 'Unpaid'}
						</span>
					</div>
					{#if event.payment.paid && event.payment.paidDate}
						<div class="flex justify-between mt-1">
							<span class="text-gray-600">Date Paid:</span>
							<span>{format(event.payment.paidDate, 'MMM d, yyyy')}</span>
						</div>
					{/if}
					{#if event.payment.paid && event.payment.method}
						<div class="flex justify-between mt-1">
							<span class="text-gray-600">Payment Method:</span>
							<span>{event.payment.method}</span>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
