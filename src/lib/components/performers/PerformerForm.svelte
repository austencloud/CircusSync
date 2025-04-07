<!-- src/lib/components/performers/PerformerForm.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Performer, PerformerSkillCategory } from '$lib/types';
    import Button from '$lib/components/ui/Button.svelte';
    import Icon from '$lib/components/ui/Icon.svelte';
    
    export let performer: Partial<Performer> = {};
    export let submitLabel = 'Save Performer';
    export let isLoading = false;
    export let showCancelButton = true;
    
    const dispatch = createEventDispatcher();
    
    // Form state
    let formData = {
      name: performer.name || '',
      email: performer.email || '',
      phone: performer.phone || '',
      address: performer.address || '',
      profilePhoto: performer.profilePhoto || '',
      skills: performer.skills || [],
      payRate: performer.payRate || [],
      notes: performer.notes || ''
    };
    
    // New skill fields
    let newSkillCategory: PerformerSkillCategory = 'other';
    let newSkillProps = '';
    let newSkillActs = '';
    let newSkillLevel: 'beginner' | 'intermediate' | 'expert' = 'intermediate';
    
    // New pay rate fields
    let newPayCategory = '';
    let newPayRate = 0;
    let newPayUnit: 'hourly' | 'per-event' | 'per-day' = 'hourly';
    
    // Skill category options
    const skillCategoryOptions: PerformerSkillCategory[] = [
      'fire',
      'balloon',
      'stilt',
      'juggle',
      'aerial',
      'magic',
      'other'
    ];
    
    // Skill category display names
    const skillCategoryNames = {
      fire: 'Fire Performance',
      balloon: 'Balloon Art',
      stilt: 'Stilt Walking',
      juggle: 'Juggling',
      aerial: 'Aerial Arts',
      magic: 'Magic',
      other: 'Other Skills'
    };
    
    // Pay rate category options
    const payRateCategoryOptions = [
      'Fire Performance',
      'Balloon Art',
      'Stilt Walking',
      'Juggling',
      'Aerial Performance',
      'Magic',
      'LED Performance',
      'Ambient Entertainment',
      'Corporate Event',
      'Festival',
      'Private Party'
    ];
    
    // Handle form submission
    function handleSubmit() {
      // Validate form fields
      if (!formData.name) {
        alert('Performer name is required');
        return;
      }
      
      dispatch('submit', formData);
    }
    
    // Handle cancel button
    function handleCancel() {
      dispatch('cancel');
    }
    
    // Add new skill
    function addSkill() {
      if (newSkillCategory) {
        const props = newSkillProps.split(',').map(p => p.trim()).filter(Boolean);
        const acts = newSkillActs.split(',').map(a => a.trim()).filter(Boolean);
        
        formData.skills = [
          ...formData.skills,
          {
            category: newSkillCategory,
            props,
            acts,
            level: newSkillLevel
          }
        ];
        
        // Reset fields
        newSkillProps = '';
        newSkillActs = '';
        newSkillLevel = 'intermediate';
      }
    }
    
    // Remove skill
    function removeSkill(index: number) {
      formData.skills = formData.skills.filter((_, i) => i !== index);
    }
    
    // Add new pay rate
    function addPayRate() {
      if (newPayCategory && newPayRate > 0) {
        formData.payRate = [
          ...formData.payRate,
          {
            category: newPayCategory,
            rate: newPayRate,
            unit: newPayUnit
          }
        ];
        
        // Reset fields
        newPayCategory = '';
        newPayRate = 0;
      }
    }
    
    // Remove pay rate
    function removePayRate(index: number) {
      formData.payRate = formData.payRate.filter((_, i) => i !== index);
    }
    
    // Get color for skill category
    function getColorForSkill(category: PerformerSkillCategory): string {
      switch(category) {
        case 'fire':
          return 'bg-red-100 text-red-800';
        case 'balloon':
          return 'bg-purple-100 text-purple-800';
        case 'stilt':
          return 'bg-green-100 text-green-800';
        case 'juggle':
          return 'bg-blue-100 text-blue-800';
        case 'aerial':
          return 'bg-pink-100 text-pink-800';
        case 'magic':
          return 'bg-amber-100 text-amber-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
    
    // Get badge color for skill level
    function getColorForSkillLevel(level: string): string {
      switch(level) {
        case 'beginner':
          return 'bg-blue-100 text-blue-800';
        case 'intermediate':
          return 'bg-amber-100 text-amber-800';
        case 'expert':
          return 'bg-green-100 text-green-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
  </script>
  
  <form on:submit|preventDefault={handleSubmit} class="space-y-6">
    <!-- Basic Information Section -->
    <div>
      <h3 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Performer Name -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
            Performer Name *
          </label>
          <input
            type="text"
            id="name"
            bind:value={formData.name}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            bind:value={formData.email}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <!-- Phone -->
        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            bind:value={formData.phone}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <!-- Profile Photo URL -->
        <div>
          <label for="profilePhoto" class="block text-sm font-medium text-gray-700 mb-1">
            Profile Photo URL
          </label>
          <input
            type="url"
            id="profilePhoto"
            bind:value={formData.profilePhoto}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/photo.jpg"
          />
        </div>
        
        <!-- Address -->
        <div class="md:col-span-2">
          <label for="address" class="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            id="address"
            bind:value={formData.address}
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          ></textarea>
        </div>
      </div>
    </div>
    
    <!-- Skills Section -->
    <div>
      <h3 class="text-lg font-medium text-gray-900 mb-4">Skills & Specialties</h3>
      
      <!-- Existing Skills -->
      {#if formData.skills.length > 0}
        <div class="mb-6 space-y-4">
          <h4 class="text-sm font-medium text-gray-700">Current Skills:</h4>
          
          {#each formData.skills as skill, index}
            <div class="bg-white border rounded-lg p-4 relative">
              <button
                type="button"
                class="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                on:click={() => removeSkill(index)}
              >
                <Icon name="x" size={18} />
              </button>
              
              <div class="flex items-center mb-2">
                <span class={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getColorForSkill(skill.category)}`}>
                  {skillCategoryNames[skill.category]}
                </span>
                
                <span class={`ml-2 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getColorForSkillLevel(skill.level)}`}>
                  {skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}
                </span>
              </div>
              
              {#if skill.props.length > 0}
                <div class="mb-2">
                  <span class="text-xs text-gray-500">Props:</span>
                  <div class="flex flex-wrap gap-1 mt-1">
                    {#each skill.props as prop}
                      <span class="inline-block px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs">
                        {prop}
                      </span>
                    {/each}
                  </div>
                </div>
              {/if}
              
              {#if skill.acts.length > 0}
                <div>
                  <span class="text-xs text-gray-500">Signature Acts:</span>
                  <div class="flex flex-wrap gap-1 mt-1">
                    {#each skill.acts as act}
                      <span class="inline-block px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs">
                        {act}
                      </span>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-gray-500 text-sm italic mb-4">No skills added yet</p>
      {/if}
      
      <!-- Add New Skill Form -->
      <div class="bg-gray-50 rounded-lg p-4 border">
        <h4 class="text-sm font-medium text-gray-700 mb-3">Add a New Skill:</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- Skill Category -->
          <div>
            <label for="skillCategory" class="block text-xs font-medium text-gray-500 mb-1">
              Skill Category
            </label>
            <select
              id="skillCategory"
              bind:value={newSkillCategory}
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {#each skillCategoryOptions as category}
                <option value={category}>{skillCategoryNames[category]}</option>
              {/each}
            </select>
          </div>
          
          <!-- Skill Level -->
          <div>
            <label for="skillLevel" class="block text-xs font-medium text-gray-500 mb-1">
              Skill Level
            </label>
            <select
              id="skillLevel"
              bind:value={newSkillLevel}
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        </div>
        
        <div class="space-y-3">
          <!-- Props -->
          <div>
            <label for="skillProps" class="block text-xs font-medium text-gray-500 mb-1">
              Props (comma separated)
            </label>
            <input
              type="text"
              id="skillProps"
              bind:value={newSkillProps}
              placeholder="Poi, Staff, Dragon Staff, Fans"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <!-- Acts -->
          <div>
            <label for="skillActs" class="block text-xs font-medium text-gray-500 mb-1">
              Signature Acts (comma separated)
            </label>
            <input
              type="text"
              id="skillActs"
              bind:value={newSkillActs}
              placeholder="Firefly, Cosmic Spin, Aerial Spiral"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div class="mt-4">
          <Button
            type="button"
            on:click={addSkill}
            size="sm"
          >
            <Icon name="plus" size={16} class="mr-1" />
            Add Skill
          </Button>
        </div>
      </div>
    </div>
    
    <!-- Pay Rates Section -->
    <div>
      <h3 class="text-lg font-medium text-gray-900 mb-4">Pay Rates</h3>
      
      <!-- Existing Pay Rates -->
      {#if formData.payRate.length > 0}
        <div class="mb-6">
          <h4 class="text-sm font-medium text-gray-700 mb-3">Current Pay Rates:</h4>
          
          <div class="bg-white border rounded-lg overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th class="px-6 py-3 relative">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {#each formData.payRate as rate, index}
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {rate.category}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${rate.rate.toFixed(2)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rate.unit === 'hourly' ? 'Per Hour' : rate.unit === 'per-event' ? 'Per Event' : 'Per Day'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        class="text-red-600 hover:text-red-800"
                        on:click={() => removePayRate(index)}
                      >
                        <Icon name="trash-2" size={16} />
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {:else}
        <p class="text-gray-500 text-sm italic mb-4">No pay rates added yet</p>
      {/if}
      
      <!-- Add New Pay Rate Form -->
      <div class="bg-gray-50 rounded-lg p-4 border">
        <h4 class="text-sm font-medium text-gray-700 mb-3">Add a New Pay Rate:</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Pay Rate Category -->
          <div>
            <label for="payCategory" class="block text-xs font-medium text-gray-500 mb-1">
              Category
            </label>
            <select
              id="payCategory"
              bind:value={newPayCategory}
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              {#each payRateCategoryOptions as category}
                <option value={category}>{category}</option>
              {/each}
              <option value="Custom">Custom...</option>
            </select>
          </div>
          
          <!-- Pay Rate Amount -->
          <div>
            <label for="payRate" class="block text-xs font-medium text-gray-500 mb-1">
              Rate (USD)
            </label>
            <input
              type="number"
              id="payRate"
              bind:value={newPayRate}
              min="0"
              step="0.01"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <!-- Pay Rate Unit -->
          <div>
            <label for="payUnit" class="block text-xs font-medium text-gray-500 mb-1">
              Unit
            </label>
            <select
              id="payUnit"
              bind:value={newPayUnit}
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="hourly">Per Hour</option>
              <option value="per-event">Per Event</option>
              <option value="per-day">Per Day</option>
            </select>
          </div>
        </div>
        
        <div class="mt-4">
          <Button
            type="button"
            on:click={addPayRate}
            size="sm"
            disabled={!newPayCategory || newPayRate <= 0}
          >
            <Icon name="plus" size={16} class="mr-1" />
            Add Pay Rate
          </Button>
        </div>
      </div>
    </div>
    
    <!-- Notes Section -->
    <div>
      <h3 class="text-lg font-medium text-gray-900 mb-4">Notes</h3>
      <textarea
        bind:value={formData.notes}
        rows="4"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Add any notes about this performer..."
      ></textarea>
    </div>
    
    <!-- Form Actions -->
    <div class="flex justify-end space-x-3 pt-4 border-t">
      {#if showCancelButton}
        <Button 
          type="button" 
          variant="outline" 
          color="gray" 
          on:click={handleCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      {/if}
      
      <Button 
        type="submit" 
        loading={isLoading}
        disabled={isLoading}
      >
        {submitLabel}
      </Button>
    </div>
  </form>