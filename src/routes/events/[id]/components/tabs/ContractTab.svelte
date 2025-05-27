<!-- src/routes/events/[id]/components/tabs/ContractTab.svelte -->
<script lang="ts">
    import { format } from 'date-fns';
    import Icon from '$lib/components/ui/Icon.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    
    export let event: any;
    export let canEdit: boolean = false;
  </script>
  
  <div class="grid md:grid-cols-2 gap-6">
    <!-- Contract Information -->
    <div class="bg-white rounded-lg shadow p-4">
      <div class="flex justify-between items-start mb-4">
        <h2 class="text-lg font-semibold">Contract Status</h2>
        {#if canEdit}
          <Button href="/events/{event.id}/contract" variant="outline">
            <Icon name="file-text" size={16} extraClass="mr-1" />
            {event.contract.url ? 'View Contract' : 'Generate Contract'}
          </Button>
        {/if}
      </div>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-gray-600">Contract Sent:</span>
          <span
            class={event.contract.sent
              ? 'text-green-600 font-medium'
              : 'text-amber-600 font-medium'}
          >
            {event.contract.sent ? 'Yes' : 'No'}
          </span>
        </div>
        {#if event.contract.sent && event.contract.sentDate}
          <div class="flex items-center justify-between">
            <span class="text-gray-600">Date Sent:</span>
            <span>{format(event.contract.sentDate, 'MMM d, yyyy')}</span>
          </div>
        {/if}
        <div class="flex items-center justify-between">
          <span class="text-gray-600">Contract Received:</span>
          <span
            class={event.contract.received
              ? 'text-green-600 font-medium'
              : 'text-amber-600 font-medium'}
          >
            {event.contract.received ? 'Yes' : 'No'}
          </span>
        </div>
        {#if event.contract.received && event.contract.receivedDate}
          <div class="flex items-center justify-between">
            <span class="text-gray-600">Date Received:</span>
            <span>{format(event.contract.receivedDate, 'MMM d, yyyy')}</span>
          </div>
        {/if}
  
        {#if event.contract.url}
          <div class="mt-4 pt-4 border-t">
            <a
              href={event.contract.url}
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
            >
              <Icon name="file-text" size={16} extraClass="mr-2" />
              View Contract
            </a>
          </div>
        {/if}
  
        {#if canEdit}
          <div class="mt-4 pt-4 border-t space-y-2">
            <h3 class="text-sm font-medium text-gray-700">Contract Actions</h3>
            {#if !event.contract.sent}
              <button
                class="inline-flex w-full items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Icon name="send" size={16} extraClass="mr-2" />
                Mark Contract as Sent
              </button>
            {/if}
            {#if event.contract.sent && !event.contract.received}
              <button
                class="inline-flex w-full items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <Icon name="check" size={16} extraClass="mr-2" />
                Mark Contract as Received
              </button>
            {/if}
            {#if !event.contract.url}
              <button
                class="inline-flex w-full items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
              <Icon name="upload" size={16} extraClass="mr-2" />
              Upload Contract
            </button>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <!-- Payment Information -->
  <div class="bg-white rounded-lg shadow p-4">
    <div class="flex justify-between items-start mb-4">
      <h2 class="text-lg font-semibold">Payment Details</h2>
      {#if canEdit}
        <Button href="/events/{event.id}/invoice" variant="outline">
          <Icon name="dollar-sign" size={16} extraClass="mr-1" />
          {event.payment.paid ? 'View Invoice' : 'Generate Invoice'}
        </Button>
      {/if}
    </div>
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <span class="text-gray-600">Total Event Value:</span>
        <span class="font-medium">${event.payment.totalValue.toFixed(2)}</span>
      </div>
      <div class="flex items-center justify-between">
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
        <div class="flex items-center justify-between">
          <span class="text-gray-600">Date Paid:</span>
          <span>{format(event.payment.paidDate, 'MMM d, yyyy')}</span>
        </div>
      {/if}
      {#if event.payment.paid && event.payment.method}
        <div class="flex items-center justify-between">
          <span class="text-gray-600">Payment Method:</span>
          <span class="capitalize">{event.payment.method}</span>
        </div>
      {/if}

      {#if event.deposit.required}
        <div class="mt-4 pt-4 border-t">
          <h3 class="text-sm font-medium text-gray-700 mb-3">Deposit Information</h3>

          <div class="flex items-center justify-between">
            <span class="text-gray-600">Deposit Amount:</span>
            <span class="font-medium">${event.deposit.amount?.toFixed(2) || 'N/A'}</span>
          </div>
          <div class="flex items-center justify-between mt-2">
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
            <div class="flex items-center justify-between mt-2">
              <span class="text-gray-600">Date Received:</span>
              <span>{format(event.deposit.receivedDate, 'MMM d, yyyy')}</span>
            </div>
          {/if}
        </div>
      {/if}

      {#if canEdit}
        <div class="mt-4 pt-4 border-t space-y-2">
          <h3 class="text-sm font-medium text-gray-700">Payment Actions</h3>
          {#if !event.payment.paid}
            <button
              class="inline-flex w-full items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <Icon name="check-circle" size={16} extraClass="mr-2" />
              Mark as Paid
            </button>
            <button
              class="inline-flex w-full items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Icon name="mail" size={16} extraClass="mr-2" />
              Send Payment Reminder
            </button>
          {/if}
          {#if event.deposit.required && !event.deposit.received}
            <button
              class="inline-flex w-full items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Icon name="check-circle" size={16} extraClass="mr-2" />
              Mark Deposit as Received
            </button>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>