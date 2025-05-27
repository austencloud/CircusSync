<script lang="ts">
	import { onMount } from 'svelte';
	import { performerStore } from '$lib/stores/performerStore';
	import type { Performer, PerformerSkillCategory } from '$lib/types';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
	import AddPerformerModal from '$lib/components/performers/AddPerformerModal.svelte';

	// State
	let loading = true;
	let searchQuery = '';
	let skillFilter: PerformerSkillCategory | 'all' = 'all';
	let sortBy: 'name' | 'recent' = 'name';
	let showAddModal = false;

	// All functionality is now accessible without authentication
	const canEdit = true;

	// Load performers
	onMount(async () => {
		try {
			await performerStore.loadPerformers();
		} catch (error) {
			console.error('Error loading performers:', error);
		} finally {
			loading = false;
		}
	});

	// Handle performer added event
	function handlePerformerAdded(event: CustomEvent<{ performer: Performer }>) {
		// The store already updated, so we just need to close the modal
		showAddModal = false;

		// Optionally, add some visual feedback or scroll to the new performer
		const newPerformer = event.detail.performer;
		// You could add a highlight class to the performer element or scroll to it
	}

	// Filtered and sorted performers
	$: filteredPerformers = $performerStore.performers
		.filter((performer) => {
			const matchesQuery =
				searchQuery === '' ||
				performer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				performer.email?.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesSkill =
				skillFilter === 'all' || performer.skills.some((skill) => skill.category === skillFilter);

			return matchesQuery && matchesSkill;
		})
		.sort((a, b) => {
			if (sortBy === 'name') {
				return a.name.localeCompare(b.name);
			} else {
				// For 'recent', we would ideally have a lastUpdated field
				// For now, fallback to name
				return a.name.localeCompare(b.name);
			}
		});

	// Skill mapping
	const skillCategoryNames: Record<PerformerSkillCategory, string> = {
		fire: 'Fire Performance',
		balloon: 'Balloon Art',
		stilt: 'Stilt Walking',
		juggle: 'Juggling',
		aerial: 'Aerial Arts',
		magic: 'Magic',
		other: 'Other Skills'
	};

	// UI helpers
	function getSkillBadgeColor(category: PerformerSkillCategory): string {
		const colors = {
			fire: 'bg-red-100 text-red-800',
			balloon: 'bg-purple-100 text-purple-800',
			stilt: 'bg-green-100 text-green-800',
			juggle: 'bg-blue-100 text-blue-800',
			aerial: 'bg-pink-100 text-pink-800',
			magic: 'bg-amber-100 text-amber-800',
			other: 'bg-gray-100 text-gray-800'
		};
		return colors[category] || colors.other;
	}
</script>

<svelte:head>
	<title>Performers | CircusSync</title>
</svelte:head>

<div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
	<div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
		<h1 class="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Performers</h1>

		{#if canEdit}
			<Button on:click={() => (showAddModal = true)} color="blue">
				<Icon name="plus" size={16} extraClass="mr-2" />
				Add Performer
			</Button>
		{/if}
	</div>

	{#if loading}
		<div class="flex justify-center items-center h-64">
			<LoadingSpinner size="lg" />
		</div>
	{:else}
		<!-- Search and filter bar -->
		<div class="bg-white p-4 rounded-lg shadow-sm mb-6">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<!-- Search -->
				<div class="relative">
					<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Icon name="search" size={16} extraClass="text-gray-400" />
					</div>
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search performers..."
						class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>

				<!-- Skill Filter -->
				<div>
					<select
						bind:value={skillFilter}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						<option value="all">All Skills</option>
						{#each Object.entries(skillCategoryNames) as [value, label]}
							<option {value}>{label}</option>
						{/each}
					</select>
				</div>

				<!-- Sort -->
				<div>
					<select
						bind:value={sortBy}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						<option value="name">Sort by Name</option>
						<option value="recent">Sort by Recent</option>
					</select>
				</div>
			</div>
		</div>

		<!-- Performers Grid -->
		{#if filteredPerformers.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each filteredPerformers as performer}
					<div
						class="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
					>
						<!-- Performer Card Header -->
						<div class="flex items-center p-4 border-b border-gray-200">
							<div class="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden bg-gray-100">
								{#if performer.profilePhoto}
									<img
										src={performer.profilePhoto}
										alt={performer.name}
										class="h-full w-full object-cover"
									/>
								{:else}
									<div
										class="h-full w-full flex items-center justify-center bg-blue-100 text-blue-600"
									>
										<Icon name="user" size={24} />
									</div>
								{/if}
							</div>
							<div class="ml-4 flex-1">
								<h3 class="text-lg font-medium text-gray-900">{performer.name}</h3>
								{#if performer.email}
									<p class="text-sm text-gray-500">{performer.email}</p>
								{/if}
							</div>
							<a
								href={`/performers/${performer.id}`}
								class="text-blue-600 hover:text-blue-800"
								aria-label="View details"
							>
								<Icon name="chevron-right" size={20} />
							</a>
						</div>

						<!-- Skills -->
						<div class="px-4 py-3 border-b border-gray-200">
							<h4 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
								Skills
							</h4>
							<div class="flex flex-wrap gap-1">
								{#each performer.skills as skill}
									<span
										class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSkillBadgeColor(
											skill.category
										)}`}
									>
										{skill.category}
									</span>
								{/each}
							</div>
						</div>

						<!-- Contact Info -->
						<div class="px-4 py-3 border-b border-gray-200">
							<h4 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
								Contact
							</h4>
							<div class="space-y-1">
								{#if performer.phone}
									<div class="flex items-center text-sm text-gray-600">
										<Icon name="phone" size={14} extraClass="mr-2" />
										{performer.phone}
									</div>
								{/if}
							</div>
						</div>

						<!-- Pay Rates Preview -->
						<div class="px-4 py-3">
							<h4 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
								Pay Rates
							</h4>
							{#if performer.payRate && performer.payRate.length > 0}
								<div class="text-sm text-gray-900">
									<span class="font-medium"
										>${Math.min(...performer.payRate.map((p) => p.rate))} - ${Math.max(
											...performer.payRate.map((p) => p.rate)
										)}</span
									>
									<span class="text-xs text-gray-500">
										({performer.payRate.length}
										{performer.payRate.length === 1 ? 'rate' : 'rates'})
									</span>
								</div>
							{:else}
								<p class="text-sm text-gray-500 italic">No pay rates defined</p>
							{/if}
						</div>

						<!-- Card Footer -->
						<div class="bg-gray-50 px-4 py-3 flex justify-between">
							<span class="text-xs text-gray-500">
								{performer.skills.length}
								{performer.skills.length === 1 ? 'skill' : 'skills'}
							</span>

							{#if canEdit}
								<a
									href={`/performers/${performer.id}`}
									class="text-blue-600 text-sm hover:underline"
								>
									Edit Profile
								</a>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="bg-white rounded-lg p-8 text-center">
				<div class="flex justify-center mb-4">
					<Icon name="search" size={48} extraClass="text-gray-300" />
				</div>
				<h3 class="text-lg font-medium text-gray-900 mb-1">No performers found</h3>
				<p class="text-gray-500">Try changing your search or filters</p>
			</div>
		{/if}
	{/if}
	<!-- Add Performer Modal -->
	<AddPerformerModal
		isOpen={showAddModal}
		on:close={() => (showAddModal = false)}
		on:added={handlePerformerAdded}
	/>
</div>
