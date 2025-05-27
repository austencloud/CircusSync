<script lang="ts">
	import Flatpickr from 'svelte-flatpickr';
	import 'flatpickr/dist/flatpickr.css'; // Ensure CSS is imported

	export let formData: any;

	// Flatpickr configuration for time
	const timeConfig = {
		enableTime: true,
		noCalendar: true,
		dateFormat: 'H:i', // 24-hour format
		time_24hr: true,
		minuteIncrement: 15
	};
</script>

<div>
	<h3 class="text-lg font-medium text-gray-900 mb-4">Performance Details</h3>

	<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
		<!-- Start Time -->
		<div>
			<label for="startTime" class="block text-sm font-medium text-gray-700 mb-1">
				Performance Start Time
			</label>
			<Flatpickr
				id="startTime"
				bind:value={formData.performanceTime.start}
				{...timeConfig}
				class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			/>
		</div>

		<!-- End Time -->
		<div>
			<label for="endTime" class="block text-sm font-medium text-gray-700 mb-1">
				Performance End Time
			</label>
			<Flatpickr
				id="endTime"
				bind:value={formData.performanceTime.end}
				{...timeConfig}
				class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			/>
		</div>

		<!-- Call Time -->
		<div>
			<label for="callTime" class="block text-sm font-medium text-gray-700 mb-1"> Call Time </label>
			<Flatpickr
				id="callTime"
				bind:value={formData.callTime}
				{...timeConfig} 
				class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			/>
		</div>

		<!-- Costume -->
		<div class="md:col-span-3">
			<label for="costume" class="block text-sm font-medium text-gray-700 mb-1">
				Costume Notes
			</label>
			<textarea
				id="costume"
				bind:value={formData.costume}
				rows="2"
				class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				placeholder="e.g. All white, formal wear, themed costumes..."
			/>
		</div>
	</div>
</div>
