<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import PerformerForm from './PerformerForm.svelte';
	import { performerStore } from '$lib/stores/performerStore';
	import type { Performer } from '$lib/types';

	export let isOpen = false;

	let isSubmitting = false;
	let errorMessage = '';

	const dispatch = createEventDispatcher<{
		close: void;
		added: { performer: Performer };
	}>();

	function closeModal() {
		dispatch('close');
	}

	async function handleSubmit(event: CustomEvent<Partial<Performer>>) {
		try {
			isSubmitting = true;
			errorMessage = '';

			// Create a valid performer object with all required fields
			const performerData = {
				name: event.detail.name || '',
				email: event.detail.email || '',
				phone: event.detail.phone || '',
				address: event.detail.address || '',
				profilePhoto: event.detail.profilePhoto || '',
				skills: event.detail.skills || [],
				payRate: event.detail.payRate || [],
				notes: event.detail.notes || '',
				pay: event.detail.pay || 0,
				availability: event.detail.availability || [],
				events: event.detail.events || []
			};

			const newPerformerId = await performerStore.addPerformer(performerData);

			// Reload performers to ensure store is updated
			await performerStore.loadPerformers();

			// Get the performers from the store
			const performers = $performerStore.performers;
			const newPerformer = performers.find((p) => p.id === newPerformerId);

			if (newPerformer) {
				dispatch('added', { performer: newPerformer });
			}

			closeModal();
		} catch (error: any) {
			console.error('Error adding performer:', error);
			errorMessage = error.message || 'Failed to add performer';
		} finally {
			isSubmitting = false;
		}
	}
</script>

{#if isOpen}
<Modal on:close={closeModal} size="xl">
	<div>
		<h2 class="text-xl font-bold text-gray-900">Add New Performer</h2>
		{#if errorMessage}
			<div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
				{errorMessage}
			</div>
		{/if}

		<PerformerForm
			on:submit={handleSubmit}
			on:cancel={closeModal}
			isLoading={isSubmitting}
			submitLabel="Add Performer"
			showCancelButton={true}
		/>
	</div>
</Modal>
{/if}
