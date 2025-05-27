<!-- src/lib/components/dashboard/DashboardCard.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '$lib/components/ui/Icon.svelte';

	// Props (using Svelte 4 syntax for now)
	export let title: string;
	export let value: number;
	export let icon: string;
	export let color: 'blue' | 'green' | 'amber' | 'red' | 'purple' = 'blue';
	export let isCurrency: boolean = false;
	export let link: string | null = null;

	const colorClasses = {
		blue: 'bg-blue-50 text-blue-700 border-blue-200',
		green: 'bg-green-50 text-green-700 border-green-200',
		amber: 'bg-amber-50 text-amber-700 border-amber-200',
		red: 'bg-red-50 text-red-700 border-red-200',
		purple: 'bg-purple-50 text-purple-700 border-purple-200'
	};

	const iconBgColors = {
		blue: 'bg-blue-100',
		green: 'bg-green-100',
		amber: 'bg-amber-100',
		red: 'bg-red-100',
		purple: 'bg-purple-100'
	};
	function handleClick() {
		if (link) {
			goto(link);
		}
	}

	function formatValue(value: number): string {
		if (isCurrency) {
			return new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD'
			}).format(value);
		}

		return value.toString();
	}
</script>

{#if link}
	<button
		class="rounded-lg border p-4 {colorClasses[
			color
		]} cursor-pointer hover:shadow-md transition-shadow w-full text-left"
		on:click={handleClick}
		aria-label="{title} - View details"
	>
		<div class="flex items-center justify-between">
			<div>
				<p class="text-sm font-medium">{title}</p>
				<p class="text-2xl font-bold mt-1">{formatValue(value)}</p>
			</div>

			<div class="{iconBgColors[color]} h-12 w-12 rounded-full flex items-center justify-center">
				<Icon name={icon} size={24} />
			</div>
		</div>
	</button>
{:else}
	<div class="rounded-lg border p-4 {colorClasses[color]}" role="region">
		<div class="flex items-center justify-between">
			<div>
				<p class="text-sm font-medium">{title}</p>
				<p class="text-2xl font-bold mt-1">{formatValue(value)}</p>
			</div>

			<div class="{iconBgColors[color]} h-12 w-12 rounded-full flex items-center justify-center">
				<Icon name={icon} size={24} />
			</div>
		</div>
	</div>
{/if}
