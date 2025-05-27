<!-- src/lib/components/ui/Modal.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import Icon from './Icon.svelte';

	// Props (temporarily using Svelte 4 syntax for compatibility)
	export let title: string = '';
	export let size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
	export let showClose = true;
	export let closeOnClickOutside = true;
	export let closeOnEsc = true;

	// Event dispatcher to notify parent components
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	// Handle closing the modal
	function close() {
		dispatch('close');
	}

	// Handle click outside
	function handleClickOutside(event: MouseEvent) {
		if (closeOnClickOutside && event.target === event.currentTarget) {
			close();
		}
	}

	// Handle keyboard events
	function handleKeydown(event: KeyboardEvent) {
		if (closeOnEsc && event.key === 'Escape') {
			close();
		}
	}

	// Size classes for the modal
	$: sizeClasses = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-xl',
		full: 'max-w-full'
	};

	// When modal is mounted, add key event listener and prevent body scrolling
	onMount(() => {
		document.addEventListener('keydown', handleKeydown);
		document.body.style.overflow = 'hidden';
	});

	// When modal is destroyed, remove key event listener and restore body scrolling
	onDestroy(() => {
		document.removeEventListener('keydown', handleKeydown);
		document.body.style.overflow = '';
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
	on:click={handleClickOutside}
	transition:fade={{ duration: 200 }}
>
	<div
		class="bg-white rounded-lg shadow-xl w-full {sizeClasses[size]} relative overflow-hidden"
		transition:fly={{ y: 20, duration: 200 }}
	>
		{#if title || showClose}
			<div class="px-6 py-4 border-b flex justify-between items-center">
				<h2 class="text-lg font-medium text-gray-900">{title}</h2>

				{#if showClose}
					<button
						class="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500"
						on:click={close}
						aria-label="Close"
					>
						<Icon name="x" size={24} />
					</button>
				{/if}
			</div>
		{/if}

		<div class="overflow-y-auto max-h-[calc(100vh-10rem)]">
			<div class="px-6 py-4">
				<slot />
			</div>

			{#if $$slots.footer}
				<div class="px-6 py-4 bg-gray-50 border-t">
					<slot name="footer" />
				</div>
			{/if}
		</div>
	</div>
</div>
