<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { format } from 'date-fns';
	import { clientStore } from '$lib/stores/clientStore';
	import { performerStore } from '$lib/stores/performerStore';
	import Button from '$lib/components/ui/Button.svelte';
	import type { Client, Event, Performer } from '$lib/types';

	// Import section components
	import BasicInfoSection from './sections/BasicInfoSection.svelte';
	import PerformanceDetailsSection from './sections/PerformanceDetailsSection.svelte';
	import ServicesSection from './sections/ServicesSection.svelte';
	import EquipmentSection from './sections/EquipmentSection.svelte';
	import PerformersSection from './sections/PerformersSection.svelte';
	import ContractSection from './sections/ContractSection.svelte';
	import PaymentSection from './sections/PaymentSection.svelte';
	import NotesSection from './sections/NotesSection.svelte';
	import ManagementSection from './sections/ManagementSection.svelte';

	export let event: Event | null = null;
	export let submitLabel = 'Create Event';
	export let isLoading = false;
	export let showCancelButton = true;
	export let preselectedClientId = null;
	export let preselectedPerformerId = null;

	const dispatch = createEventDispatcher();

	// Form state initialization
	let formData = {
		name: event?.name || '',
		date: event?.date
			? format(new Date(event.date), 'yyyy-MM-dd')
			: format(new Date(), 'yyyy-MM-dd'),
		client: event?.client || preselectedClientId || '',
		location: {
			address: event?.location?.address || '',
			notes: event?.location?.notes || '',
			mapLink: event?.location?.mapLink || ''
		},
		status: event?.status || 'inquiry',
		performers: event?.performers || [],
		services: event?.services || [],
		performanceTime: {
			start: event?.performanceTime?.start || '18:00',
			end: event?.performanceTime?.end || '20:00'
		},
		callTime: event?.callTime || '17:00',
		costume: event?.costume || '',
		equipmentNeeded: event?.equipmentNeeded || [],
		contract: {
			sent: event?.contract?.sent || false,
			sentDate: event?.contract?.sentDate || null,
			received: event?.contract?.received || false,
			receivedDate: event?.contract?.receivedDate || null,
			url: event?.contract?.url || ''
		},
		deposit: {
			required: event?.deposit?.required || false,
			amount: event?.deposit?.amount || 0,
			received: event?.deposit?.received || false,
			receivedDate: event?.deposit?.receivedDate || null
		},
		payment: {
			totalValue: event?.payment?.totalValue || 0,
			paid: event?.payment?.paid || false,
			paidDate: event?.payment?.paidDate || null,
			method: event?.payment?.method || ''
		},
		notes: event?.notes || '',
		clientLiaison: event?.clientLiaison || '',
		gigManager: event?.gigManager || ''
	};

	// Form references and selects
	let clients: Client[] = [];
	let performers: Performer[] = [];

	// Options for selects
	const statusOptions = [
		{ value: 'inquiry', label: 'Inquiry' },
		{ value: 'confirmed', label: 'Confirmed' },
		{ value: 'deposit-received', label: 'Deposit Received' },
		{ value: 'completed', label: 'Completed' },
		{ value: 'cancelled', label: 'Cancelled' }
	];

	const serviceOptions = [
		'Fire Performance',
		'Juggling',
		'Stilt Walking',
		'Aerial Performance',
		'Balloon Art',
		'Magic',
		'LED Performance',
		'Ambient Entertainment',
		'Choreographed Show',
		'Interactive Workshop'
	];

	const paymentMethodOptions = [
		{ value: 'check', label: 'Check' },
		{ value: 'cash', label: 'Cash' },
		{ value: 'transfer', label: 'Bank Transfer' },
		{ value: 'credit-card', label: 'Credit Card' }
	];

	// Load data when component mounts
	onMount(async () => {
		try {
			// Load clients
			await clientStore.loadClients();
			clients = $clientStore.clients;

			// Load performers
			await performerStore.loadPerformers();
			performers = $performerStore.performers;

			// If we have a preselected performer, add them to the event
			if (preselectedPerformerId) {
				const performer = performers.find((p: Performer) => p.id === preselectedPerformerId);
				if (performer) {
					// You'll need to implement this later
					// addPerformerToEvent(performer);
				}
			}
		} catch (error) {
			console.error('Error loading form data:', error);
		}
	});

	// Form validation
	function validateForm() {
		if (!formData.name) {
			alert('Event name is required');
			return false;
		}

		if (!formData.date) {
			alert('Event date is required');
			return false;
		}

		if (!formData.client) {
			alert('Please select a client');
			return false;
		}

		if (!formData.location.address) {
			alert('Event location is required');
			return false;
		}

		return true;
	}

	// Handle form submission
	function handleSubmit() {
		if (!validateForm()) return;

		// Convert string dates to Date objects
		const submissionData = {
			...formData,
			date: new Date(formData.date),
			contract: {
				...formData.contract,
				sentDate: formData.contract.sentDate ? new Date(formData.contract.sentDate) : null,
				receivedDate:
					formData.contract.received && formData.contract.receivedDate
						? new Date(formData.contract.receivedDate)
						: null
			},
			deposit: {
				...formData.deposit,
				receivedDate:
					formData.deposit.received && formData.deposit.receivedDate
						? new Date(formData.deposit.receivedDate)
						: null
			},
			payment: {
				...formData.payment,
				paidDate:
					formData.payment.paid && formData.payment.paidDate
						? new Date(formData.payment.paidDate)
						: null
			}
		};

		dispatch('submit', submissionData);
	}

	// Handle cancel button
	function handleCancel() {
		dispatch('cancel');
	}
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-8">
	<div class="max-w-4xl mx-auto space-y-8">
		<BasicInfoSection {formData} {clients} {statusOptions} />

		<PerformanceDetailsSection {formData} />

		<div>
			<ServicesSection {formData} {serviceOptions} />
			<EquipmentSection {formData} />
		</div>

		<PerformersSection {formData} {performers} />

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<ContractSection {formData} />
			<PaymentSection {formData} {paymentMethodOptions} />
		</div>

		<NotesSection {formData} />

		<ManagementSection {formData} />

		<div class="flex justify-end space-x-3 pt-6 border-t">
			{#if showCancelButton}
				<Button
					type="button"
					variant="outline"
					color="gray"
					on:click={handleCancel}
					disabled={isLoading}
				>
					Cancel
				</Button>
			{/if}

			<Button type="submit" loading={isLoading} disabled={isLoading}>
				{submitLabel}
			</Button>
		</div>
	</div>
</form>
