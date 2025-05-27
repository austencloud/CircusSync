<!-- src/routes/events/[id]/components/EventTabs.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Tab from '$lib/components/ui/Tab.svelte';

	export let activeTab: string = 'details';

	const dispatch = createEventDispatcher();

	function handleTabChange(tab: string) {
		dispatch('tabChange', tab);
	}
</script>

<div class="bg-white border-b">
	<div class="max-w-7xl mx-auto px-4">
		<div class="flex overflow-x-auto">
			<Tab
				label="Details"
				active={activeTab === 'details'}
				on:click={() => handleTabChange('details')}
			/>
			<Tab
				label="Performers"
				active={activeTab === 'performers'}
				on:click={() => handleTabChange('performers')}
			/>
			<Tab
				label="Client Info"
				active={activeTab === 'client'}
				on:click={() => handleTabChange('client')}
			/>
			<Tab
				label="Contract & Payment"
				active={activeTab === 'contract'}
				on:click={() => handleTabChange('contract')}
			/>
			<Tab label="Notes" active={activeTab === 'notes'} on:click={() => handleTabChange('notes')} />
		</div>
	</div>
</div>
