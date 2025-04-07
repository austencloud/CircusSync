<!-- src/routes/performers/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { performerStore } from '$lib/stores/performerStore';
    import { checkUserRole } from '$lib/services/auth';
    import Icon from '$lib/components/ui/Icon.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Badge from '$lib/components/ui/Badge.svelte';
    import Modal from '$lib/components/ui/Modal.svelte';
    import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
    import PerformerForm from '$lib/components/performers/PerformerForm.svelte';
    
    // State variables
    let loading = true;
    let searchTerm = '';
    let skillFilter = 'all';
    let showAddPerformerModal = false;
    let showFilterPanel = false;
    
    // User permissions
    let canAddPerformer: boolean;
    
    // Get URL query parameters
    $: urlFilter = $page.url.searchParams.get('skill') || 'all';
    
    // Skill filter options
    const skillOptions = [
      { value: 'all', label: 'All Skills' },
      { value: 'fire', label: 'Fire Performance' },
      { value: 'balloon', label: 'Balloon Art' },
      { value: 'stilt', label: 'Stilt Walking' },
      { value: 'juggle', label: 'Juggling' },
      { value: 'aerial', label: 'Aerial Arts' },
      { value: 'magic', label: 'Magic' },
      { value: 'other', label: 'Other Skills' }
    ];
    
    // Initialize page
    onMount(async () => {
      try {
        // Check user permissions
        const checkRole = checkUserRole('manager');
        canAddPerformer = $checkRole;
        
        // Set the filter from URL if it exists
        if (urlFilter && urlFilter !== 'all') {
          skillFilter = urlFilter;
        }
        
        // Load performers based on filter
        if (skillFilter !== 'all') {
          await performerStore.loadPerformersBySkill(skillFilter);
        } else {
          await performerStore.loadPerformers();
        }
      } catch (error) {
        console.error('Error loading performers:', error);
      } finally {
        loading = false;
      }
    });
    
    // Filter performers based on search term
    $: filteredPerformers = $performerStore.performers.filter(performer => {
      if (!searchTerm) return true;
      
      const search = searchTerm.toLowerCase();
      return (
        performer.name.toLowerCase().includes(search) ||
        performer.email.toLowerCase().includes(search) ||
        performer.phone.toLowerCase().includes(search) ||
        performer.skills.some(skill => 
          skill.category.toLowerCase().includes(search) ||
          skill.props.some(prop => prop.toLowerCase().includes(search)) ||
          skill.acts.some(act => act.toLowerCase().includes(search))
        )
      );
    });
    
    // Sort performers alphabetically
    $: sortedPerformers = [...filteredPerformers].sort((a, b) => a.name.localeCompare(b.name));
    
    // Handle search
    function handleSearch() {
      // Filter is done reactively, no additional action needed
    }
    
    // Handle filter change
    async function handleFilterChange() {
      loading = true;
      
      try {
        // Update URL query parameter
        goto(`/performers?skill=${skillFilter}`, { replaceState: true });
        
        // Load performers based on filter
        if (skillFilter !== 'all') {
          await performerStore.loadPerformersBySkill(skillFilter);
        } else {
          await performerStore.loadPerformers();
        }
      } catch (error) {
        console.error('Error filtering performers:', error);
      } finally {
        loading = false;
        showFilterPanel = false; // Close filter panel on mobile
      }
    }
    
    // Toggle mobile filter panel
    function toggleFilterPanel() {
      showFilterPanel = !showFilterPanel;
    }
    
    // Handle performer add
    async function handleAddPerformer(performerData) {
      try {
        const performerId = await performerStore.addPerformer(performerData);
        showAddPerformerModal = false;
        
        // Navigate to the new performer
        goto(`/performers/${performerId}`);
      } catch (error) {
        console.error('Error adding performer:', error);
      }
    }
    
    // Get color for skill category badge
    function getColorForSkill(category: string): string {
      switch(category) {
        case 'fire':
          return 'red';
        case 'balloon':
          return 'purple';
        case 'stilt':
          return 'green';
        case 'juggle':
          return 'blue';
        case 'aerial':
          return 'amber';
        case 'magic':
          return 'blue';
        default:
          return 'gray';
      }
    }
    
    // Get color for skill level badge
    function getColorForLevel(level: string): string {
      switch(level) {
        case 'beginner':
          return 'blue';
        case 'intermediate':
          return 'amber';
        case 'expert':
          return 'green';
        default:
          return 'gray';
      }
    }
    
    // Format skill category for display
    function formatSkillCategory(category: string): string {
      switch(category) {
        case 'fire':
          return 'Fire Performance';
        case 'balloon':
          return 'Balloon Art';
        case 'stilt':
          return 'Stilt Walking';
        case 'juggle':
          return 'Juggling';
        case 'aerial':
          return 'Aerial Arts';
        case 'magic':
          return 'Magic';
        default:
          return 'Other';
      }
    }
  </script>
  
  <svelte:head>
    <title>Performers | CircusSync</title>
  </svelte:head>
  
  <div class="bg-white shadow">
    <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Performers</h1>
        
        <div class="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <!-- Filter button (mobile) -->
          <button
            type="button"
            class="sm:hidden inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            on:click={toggleFilterPanel}
          >
            <Icon name="filter" size={18} class="mr-1" />
            Filter by Skill
          </button>
          
          {#if canAddPerformer}
            <Button on:click={() => showAddPerformerModal = true}>
              <Icon name="plus" size={18} class="mr-1" />
              Add Performer
            </Button>
          {/if}
        </div>
      </div>
    </div>
  </div>
  
  <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <div class="mb-6 flex flex-col sm:flex-row justify-between gap-4">
      <!-- Search -->
      <div class="w-full sm:w-auto flex-1 max-w-md">
        <form on:submit|preventDefault={handleSearch} class="flex">
          <div class="relative flex-grow">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="search" size={18} class="text-gray-400" />
            </div>
            <input
              type="text"
              bind:value={searchTerm}
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search performers..."
            />
          </div>
          <Button type="submit" class="ml-2" variant="outline">Search</Button>
        </form>
      </div>
      
      <!-- Skill filter (desktop) -->
      <div class="hidden sm:block">
        <select
          bind:value={skillFilter}
          on:change={handleFilterChange}
          class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          {#each skillOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>
    </div>
    
    <!-- Mobile filter panel -->
    {#if showFilterPanel}
      <div class="sm:hidden bg-gray-50 rounded-md p-4 mb-6">
        <h3 class="text-lg font-medium text-gray-900">Filters</h3>
        
        <div class="mt-4">
          <label for="mobile-skill-filter" class="block text-sm font-medium text-gray-700">
            Skill Type
          </label>
          <select
            id="mobile-skill-filter"
            bind:value={skillFilter}
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            {#each skillOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </div>
        
        <div class="mt-4 flex justify-end">
          <Button size="sm" on:click={handleFilterChange}>Apply Filters</Button>
        </div>
      </div>
    {/if}
    
    {#if loading}
      <div class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    {:else if sortedPerformers.length === 0}
      <div class="bg-white rounded-lg shadow-sm p-6 text-center">
        <Icon name="user" size={48} class="mx-auto text-gray-400 mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-1">No performers found</h3>
        <p class="text-gray-500">
          {searchTerm
            ? `No performers matching "${searchTerm}"`
            : skillFilter !== 'all'
              ? `No performers with ${formatSkillCategory(skillFilter)} skills found`
              : 'You have no performers yet'}
        </p>
        
        {#if canAddPerformer}
          <Button on:click={() => showAddPerformerModal = true} class="mt-4">
            <Icon name="plus" size={18} class="mr-1" />
            Add Your First Performer
          </Button>
        {/if}
      </div>
    {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each sortedPerformers as performer (performer.id)}
          <div class="bg-white shadow overflow-hidden rounded-lg">
            <div class="px-4 py-5 sm:px-6">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-medium text-gray-900 truncate">
                  {performer.name}
                </h3>
                
                {#if performer.skills && performer.skills.length > 0}
                  <Badge color={getColorForSkill(performer.skills[0].category)}>
                    {formatSkillCategory(performer.skills[0].category)}
                  </Badge>
                {/if}
              </div>
              
              {#if performer.email || performer.phone}
                <div class="mt-2 text-sm text-gray-500">
                  {#if performer.email}
                    <div class="flex items-center">
                      <Icon name="mail" size={16} class="flex-shrink-0 mr-1.5 text-gray-400" />
                      <a href="mailto:{performer.email}" class="text-blue-600 hover:underline truncate">
                        {performer.email}
                      </a>
                    </div>
                  {/if}
                  
                  {#if performer.phone}
                    <div class="flex items-center mt-1">
                      <Icon name="phone" size={16} class="flex-shrink-0 mr-1.5 text-gray-400" />
                      <a href="tel:{performer.phone}" class="text-blue-600 hover:underline">
                        {performer.phone}
                      </a>
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
            
            {#if performer.skills && performer.skills.length > 0}
              <div class="border-t border-gray-200 px-4 py-4 sm:px-6 bg-gray-50">
                <h4 class="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Skills</h4>
                <div class="flex flex-wrap gap-1">
                  {#each performer.skills as skill}
                    <div class="flex items-center">
                      <span class="inline-block px-2 py-1 text-xs rounded-full {`bg-${getColorForSkill(skill.category)}-100 text-${getColorForSkill(skill.category)}-800`}">
                        {formatSkillCategory(skill.category)}
                      </span>
                      {#if skill.level}
                        <span class="ml-1 inline-block px-2 py-1 text-xs rounded-full {`bg-${getColorForLevel(skill.level)}-100 text-${getColorForLevel(skill.level)}-800`}">
                          {skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}
                        </span>
                      {/if}
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
            
            <div class="border-t border-gray-200 px-4 py-4 sm:px-6">
              <a 
                href="/performers/{performer.id}" 
                class="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center"
              >
                View Profile
                <Icon name="arrow-right" size={16} class="ml-1" />
              </a>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
  
  <!-- Add Performer Modal -->
  {#if showAddPerformerModal}
    <Modal
      title="Add New Performer"
      size="lg"
      on:close={() => showAddPerformerModal = false}
    >
      <PerformerForm
        on:submit={handleAddPerformer}
        on:cancel={() => showAddPerformerModal = false}
      />
    </Modal>
  {/if}