<script lang="ts">
    import { onMount } from 'svelte';
    import { format } from 'date-fns';
    import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
    import DashboardCard from '$lib/components/dashboard/DashboardCard.svelte';
    import UpcomingEvents from '$lib/components/dashboard/UpcomingEvents.svelte';
    import FollowUpList from '$lib/components/dashboard/FollowUpList.svelte';
    import TaskList from '$lib/components/dashboard/TaskList.svelte';
    import RecentActivity from '$lib/components/dashboard/RecentActivity.svelte';
    import { eventStore } from '$lib/stores/eventStore';
    import { clientStore } from '$lib/stores/clientStore';
    import { performerStore } from '$lib/stores/performerStore';
    import { user } from '$lib/services/auth';
    import type { Task } from '$lib/types'; // <-- IMPORT Task type

    // State
    let loading = true;

    // Mock data for initial development - Explicitly typed as Task[]
    const mockTasks: Task[] = [ // <-- ADD Type Annotation Task[]
        {
            id: '1',
            title: 'Send contract to Pritzker Elementary',
            description: 'For the Back to School event',
            dueDate: new Date(2024, 6, 21), // July 21, 2024
            completed: false,
            priority: 'high', // TS now knows this must be 'high', 'medium', or 'low'
            assignedTo: 'user1',
            relatedTo: {
                type: 'client',
                id: 'client1'
            },
            createdAt: new Date(2024, 6, 1),
            updatedAt: new Date(2024, 6, 1)
        },
        {
            id: '2',
            title: 'Follow up with Agudath Jacob',
            description: 'Regarding Hannukah planning',
            dueDate: new Date(2024, 6, 14), // July 14, 2024
            completed: false,
            priority: 'high', // OK
            assignedTo: 'user1',
            relatedTo: {
                type: 'client',
                id: 'client2'
            },
            createdAt: new Date(2024, 6, 1),
            updatedAt: new Date(2024, 6, 1)
        },
        {
            id: '3',
            title: 'Confirm performers for Jefferson Park',
            description: 'Block party on August 15',
            dueDate: new Date(2024, 7, 1), // August 1, 2024
            completed: false,
            priority: 'medium', // OK
            assignedTo: 'user1',
            relatedTo: {
                type: 'event',
                id: 'event3'
            },
            createdAt: new Date(2024, 6, 2),
            updatedAt: new Date(2024, 6, 2)
        },
        {
            id: '4',
            title: 'Order new fire props',
            description: 'Replace worn-out equipment',
            dueDate: new Date(2024, 6, 30), // July 30, 2024
            completed: true,
            priority: 'low', // OK
            assignedTo: 'user1',
            // relatedTo is optional, so omitting it here is fine if needed
            createdAt: new Date(2024, 5, 15),
            updatedAt: new Date(2024, 6, 5)
        }
    ];

    // Dashboard metrics
    let metrics = {
        upcomingEvents: 0,
        pendingContracts: 0,
        followUpsNeeded: 0,
        monthlyRevenue: 0,
        activeClients: 0,
        totalPerformers: 0
    };

    onMount(async () => {
        try {
            // Load data in parallel
            await Promise.all([
                eventStore.loadUpcomingEvents(),
                clientStore.loadFollowUpClients(),
                performerStore.loadPerformers()
            ]);

            // Calculate metrics
            metrics = {
                upcomingEvents: $eventStore.events.filter(
                    (e) => e.status !== 'completed' && e.status !== 'cancelled'
                ).length,
                pendingContracts: $eventStore.events.filter((e) => !e.contract.sent || !e.contract.received)
                    .length,
                followUpsNeeded: $clientStore.clients.filter((c) => c.nextFollowUp && c.nextFollowUp.date)
                    .length,
                monthlyRevenue: calculateMonthlyRevenue($eventStore.events),
                activeClients: $clientStore.clients.filter((c) => c.status === 'active').length,
                totalPerformers: $performerStore.performers.length
            };
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            loading = false;
        }
    });

    // Helper function to calculate monthly revenue
    // Explicitly type the events parameter if possible, e.g., events: Event[]
    function calculateMonthlyRevenue(events: any[]) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        return events
            .filter(
                (event) =>
                    event.date instanceof Date && // Add check for valid date
                    event.date >= startOfMonth && event.date <= endOfMonth && event.status !== 'cancelled'
            )
            .reduce((sum, event) => sum + (event.payment?.totalValue || 0), 0); // Safer access
    }
</script>

<svelte:head>
    <title>Dashboard | CircusSync</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500 mb-6">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">Welcome back, {$user?.name || 'User'}</h1>
                <p class="text-gray-600 mt-1">Here's what's happening with your production company today</p>
            </div>
            <p class="text-sm text-gray-500">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
    </div>

    {#if loading}
        <div class="flex justify-center py-12">
            <LoadingSpinner size="lg" />
        </div>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <DashboardCard
                title="Upcoming Events"
                value={metrics.upcomingEvents}
                icon="calendar"
                color="blue"
                link="/events?filter=upcoming"
            />

            <DashboardCard
                title="Pending Contracts"
                value={metrics.pendingContracts}
                icon="file-text"
                color="amber"
                link="/events?filter=pending-contracts"
            />

            <DashboardCard
                title="Follow-Ups Needed"
                value={metrics.followUpsNeeded}
                icon="bell"
                color="red"
                link="/clients?filter=follow-up"
            />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <DashboardCard
                title="Monthly Revenue"
                value={metrics.monthlyRevenue}
                icon="dollar-sign"
                color="green"
                isCurrency={true}
            />

            <DashboardCard
                title="Active Clients"
                value={metrics.activeClients}
                icon="users"
                color="purple"
                link="/clients?filter=active"
            />

            <DashboardCard
                title="Total Performers"
                value={metrics.totalPerformers}
                icon="star"
                color="blue"
                link="/performers"
            />
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white rounded-lg shadow">
                <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
                    <h3 class="text-lg leading-6 font-medium text-gray-900">Upcoming Events</h3>
                </div>
                <div class="px-4 py-5 sm:p-6">
                    <UpcomingEvents
                        events={$eventStore.events
                            .filter((e) => e.status !== 'completed' && e.status !== 'cancelled')
                            .slice(0, 5)}
                    />
                </div>
            </div>

            <div class="bg-white rounded-lg shadow">
                <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
                    <h3 class="text-lg leading-6 font-medium text-gray-900">Your Tasks</h3>
                </div>
                <div class="px-4 py-5 sm:p-6">
                    <TaskList tasks={mockTasks} />
                </div>
            </div>

            <div class="bg-white rounded-lg shadow">
                <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
                    <h3 class="text-lg leading-6 font-medium text-gray-900">Follow-Ups Needed</h3>
                </div>
                <div class="px-4 py-5 sm:p-6">
                    <FollowUpList
                        clients={$clientStore.clients
                            .filter((c) => c.nextFollowUp && c.nextFollowUp.date)
                            .slice(0, 5)}
                    />
                </div>
            </div>

            <div class="bg-white rounded-lg shadow">
                <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
                    <h3 class="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
                </div>
                <div class="px-4 py-5 sm:p-6">
                    <RecentActivity />
                </div>
            </div>
        </div>
    {/if}
</div>
