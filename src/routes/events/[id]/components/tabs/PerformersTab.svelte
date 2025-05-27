<!-- src/routes/events/[id]/components/tabs/PerformersTab.svelte -->
<script lang="ts">
	import Icon from '$lib/components/ui/Icon.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	export let event: any;
	export let eventPerformers: any[] = [];
	export let canEdit: boolean = false;
</script>

<div>
	<div class="flex justify-between items-center mb-4">
		<h2 class="text-lg font-semibold">Performers ({eventPerformers.length})</h2>
		{#if canEdit}
			<Button href="/events/{event.id}/add-performer">
				<Icon name="plus" size={16} extraClass="mr-1" />
				Add Performer
			</Button>
		{/if}
	</div>

	{#if eventPerformers.length === 0}
		<div class="bg-white rounded-lg shadow p-8 text-center">
			<p class="text-gray-500">No performers assigned to this event yet.</p>
			{#if canEdit}
				<Button href="/events/{event.id}/add-performer" className="mt-4">Add Performer</Button>
			{/if}
		</div>
	{:else}
		<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each eventPerformers as performer}
				<div class="bg-white rounded-lg shadow overflow-hidden">
					<div class="p-4">
						<div class="flex justify-between items-start">
							<div>
								<h3 class="font-medium">{performer.name}</h3>
							</div>
						</div>
						<div class="mt-3 text-sm">
							<div class="flex items-center">
								<Icon name="mail" size={14} extraClass="text-gray-400 mr-2" />
								<a href="mailto:{performer.email}" class="text-blue-600 hover:underline">
									{performer.email}
								</a>
							</div>
							<div class="flex items-center mt-1">
								<Icon name="phone" size={14} extraClass="text-gray-400 mr-2" />
								<a href="tel:{performer.phone}" class="text-blue-600 hover:underline">
									{performer.phone}
								</a>
							</div>
						</div>

						{#if performer.skills && performer.skills.length > 0}
							<div class="mt-3">
								<h4 class="text-xs text-gray-500 font-medium mb-1">Skills</h4>
								<div class="flex flex-wrap gap-1">
									{#each performer.skills as skill}
										<span
											class="inline-block px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800"
										>
											{skill.category}
										</span>
									{/each}
								</div>
							</div>
						{/if}
					</div>

					{#if canEdit}
						<div class="bg-gray-50 px-4 py-3 border-t flex justify-between">
							<button class="text-sm text-blue-600 hover:underline"> View Profile </button>
							<button class="text-sm text-red-600 hover:underline"> Remove </button>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
