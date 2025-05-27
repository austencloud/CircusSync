<script lang="ts">
	import { format } from 'date-fns';
	export let formData: any;
	export let paymentMethodOptions: any[] = [];

	function handleDepositReceivedChange(e: Event) {
		const target = e.target as HTMLInputElement;
		updateDepositReceived(target.checked);
	}

	function handlePaymentPaidChange(e: Event) {
		const target = e.target as HTMLInputElement;
		updatePaymentPaid(target.checked);
	}

	function updateDepositReceived(value: boolean) {
		formData.deposit.received = value;
		formData.deposit.receivedDate = value ? new Date() : null;

		// If deposit received, update status if it's still an inquiry
		if (value && formData.status === 'inquiry') {
			formData.status = 'deposit-received';
		}
	}

	function updatePaymentPaid(value: boolean) {
		formData.payment.paid = value;
		formData.payment.paidDate = value ? new Date() : null;
	}
</script>

<div class="bg-gray-50 p-4 rounded-md border border-gray-200">
	<h4 class="text-sm font-medium text-gray-700 mb-3">Payment Information</h4>

	<div class="space-y-4">
		<!-- Total Value -->
		<div>
			<label for="totalValue" class="block text-sm font-medium text-gray-700 mb-1">
				Total Event Value
			</label>
			<div class="relative rounded-md shadow-sm">
				<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<span class="text-gray-500 sm:text-sm">$</span>
				</div>
				<input
					type="number"
					id="totalValue"
					bind:value={formData.payment.totalValue}
					min="0"
					step="0.01"
					class="w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
					placeholder="0.00"
				/>
				<div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
					<span class="text-gray-500 sm:text-sm">USD</span>
				</div>
			</div>
		</div>

		<!-- Deposit Section -->
		<div class="pt-4 border-t border-gray-200 mt-4">
			<h5 class="text-xs font-medium text-gray-500 mb-2">Deposit</h5>
			<div class="flex items-center mb-2">
				<input
					type="checkbox"
					id="depositRequired"
					checked={formData.deposit.required}
					class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
				/>
				<label for="depositRequired" class="ml-2 block text-sm text-gray-700">
					Deposit Required
				</label>
			</div>

			{#if formData.deposit.required}
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="depositAmount" class="block text-xs font-medium text-gray-500 mb-1">
							Deposit Amount
						</label>
						<div class="relative rounded-md shadow-sm">
							<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<span class="text-gray-500 sm:text-sm">$</span>
							</div>
							<input
								type="number"
								id="depositAmount"
								bind:value={formData.deposit.amount}
								min="0"
								step="0.01"
								class="w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
							/>
						</div>
					</div>
					<div>
						<div class="flex items-center h-full mt-4">
							<input
								type="checkbox"
								id="depositReceived"
								checked={formData.deposit.received}
								on:change={handleDepositReceivedChange}
								class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
							/>
							<label for="depositReceived" class="ml-2 block text-sm text-gray-700">
								Deposit Received
							</label>
							{#if formData.deposit.received && formData.deposit.receivedDate}
								<span class="ml-2 text-xs text-gray-500">
									({format(new Date(formData.deposit.receivedDate), 'MMM d, yyyy')})
								</span>
							{/if}
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Final Payment Section -->
		<div class="pt-4 border-t border-gray-200 mt-4">
			<h5 class="text-xs font-medium text-gray-500 mb-2">Final Payment</h5>
			<div class="flex items-center mb-2">
				<input
					type="checkbox"
					id="paymentPaid"
					checked={formData.payment.paid}
					on:change={handlePaymentPaidChange}
					class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
				/>
				<label for="paymentPaid" class="ml-2 block text-sm text-gray-700">
					Final Payment Received
				</label>
			</div>
		</div>

		{#if formData.payment.paid}
			<div>
				<label for="paymentMethod" class="block text-sm font-medium text-gray-700 mb-1">
					Payment Method
				</label>
				<select
					id="paymentMethod"
					bind:value={formData.payment.method}
					class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				>
					<option value="">Select method</option>
					{#each paymentMethodOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>
		{/if}
	</div>
</div>
