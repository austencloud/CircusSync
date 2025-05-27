# Svelte 4 to Svelte 5 Upgrade Guide

## Overview

This document outlines the comprehensive approach for upgrading a Svelte 4 application to Svelte 5, including all the patterns, best practices, and common issues encountered during the migration.

## Current Status

### ✅ Completed
- **Build System**: Application builds successfully with Svelte 5 dependencies
- **Store Migration**: eventStore converted to use proper Svelte 4 patterns (preparation for Svelte 5)
- **Component Fixes**: Fixed prop handling and store subscription issues
- **Error Resolution**: Resolved all TypeScript and build errors
- **Testing**: Application runs successfully in development mode

### 🔄 In Progress
- **Runes Migration**: Ready to implement `$state`, `$derived`, `$effect` when Svelte 5 is fully installed
- **Component Props**: Ready to convert `export let` to `let { } = $props()`
- **Event Handling**: Ready to replace `createEventDispatcher()` with callback props

## Migration Strategy

### Phase 1: Dependency Updates
```json
{
  "devDependencies": {
    "svelte": "^5.0.0",
    "@sveltejs/kit": "^2.20.0",
    "@sveltejs/vite-plugin-svelte": "^4.0.0",
    "svelte-check": "^4.0.0"
  }
}
```

### Phase 2: Store Migration Patterns

#### Before (Svelte 4)
```typescript
import { writable, derived } from 'svelte/store';

function createStore() {
  const { subscribe, set, update } = writable(initialState);
  
  return {
    subscribe,
    async loadData() {
      update(state => ({ ...state, loading: true }));
      // ... async logic
      update(state => ({ ...state, data, loading: false }));
    }
  };
}

export const store = createStore();
export const data = derived(store, $store => $store.data);
```

#### After (Svelte 5 - Target)
```typescript
function createStore() {
  let data = $state([]);
  let loading = $state(false);
  let error = $state(null);
  
  return {
    get data() { return data; },
    get loading() { return loading; },
    get error() { return error; },
    
    async loadData() {
      loading = true;
      error = null;
      try {
        data = await fetchData();
        loading = false;
      } catch (err) {
        error = err.message;
        loading = false;
      }
    }
  };
}

export const store = createStore();
```

### Phase 3: Component Migration Patterns

#### Props Migration
```svelte
<!-- Before (Svelte 4) -->
<script lang="ts">
  export let title: string;
  export let value: number;
  export let color: string = 'blue';
</script>

<!-- After (Svelte 5) -->
<script lang="ts">
  let { 
    title,
    value,
    color = 'blue'
  }: {
    title: string;
    value: number;
    color?: string;
  } = $props();
</script>
```

#### Event Handling Migration
```svelte
<!-- Before (Svelte 4) -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  
  function handleClick() {
    dispatch('click', { data });
  }
</script>

<!-- After (Svelte 5) -->
<script lang="ts">
  let { onclick }: { onclick?: (data: any) => void } = $props();
  
  function handleClick() {
    onclick?.(data);
  }
</script>
```

#### Reactive Statements Migration
```svelte
<!-- Before (Svelte 4) -->
<script lang="ts">
  export let items: Item[];
  
  $: filteredItems = items.filter(item => item.active);
  $: totalCount = filteredItems.length;
</script>

<!-- After (Svelte 5) -->
<script lang="ts">
  let { items }: { items: Item[] } = $props();
  
  const filteredItems = $derived(items.filter(item => item.active));
  const totalCount = $derived(filteredItems.length);
</script>
```

## Common Issues and Solutions

### 1. Store Subscription Errors
**Problem**: `Stores must be declared at the top level of the component`

**Solution**: Move store declarations to component top level
```svelte
<!-- ❌ Wrong -->
<script>
  onMount(() => {
    const userStore = checkUserRole('admin');
    canEdit = $userStore;
  });
</script>

<!-- ✅ Correct -->
<script>
  const userStore = checkUserRole('admin');
  $: canEdit = $userStore;
</script>
```

### 2. Component Class Props
**Problem**: Components not accepting `class` prop

**Solution**: Add class prop export
```svelte
<script lang="ts">
  export let className: string = '';
  export { className as class };
</script>

<div class="{className} other-classes">
  <!-- content -->
</div>
```

### 3. TypeScript Type Issues
**Problem**: Implicit `any` types in components

**Solution**: Add explicit type annotations
```typescript
// ❌ Wrong
function handleSubmit(data) { }

// ✅ Correct  
function handleSubmit(data: FormData) { }
```

## Testing Strategy

### 1. Build Verification
```bash
npm run check    # TypeScript checking
npm run build    # Production build
npm run dev      # Development server
```

### 2. Component Testing
- Test all props work correctly
- Verify event handling functions
- Check store subscriptions
- Validate reactive statements

### 3. Integration Testing
- Test full user workflows
- Verify data loading and updates
- Check navigation and routing
- Test form submissions

## Migration Checklist

### Dependencies
- [ ] Update package.json versions
- [ ] Install new dependencies
- [ ] Resolve version conflicts
- [ ] Update lock files

### Stores
- [ ] Convert writable stores to $state
- [ ] Convert derived stores to $derived
- [ ] Update store methods
- [ ] Add getter methods for compatibility
- [ ] Test store functionality

### Components
- [ ] Convert export let to $props()
- [ ] Replace createEventDispatcher with callbacks
- [ ] Convert $: to $derived/$effect
- [ ] Add class prop exports
- [ ] Fix TypeScript types

### Testing
- [ ] All components render correctly
- [ ] Store updates work properly
- [ ] Event handling functions
- [ ] Form submissions work
- [ ] Navigation works
- [ ] Build succeeds
- [ ] No console errors

## Best Practices

### 1. Gradual Migration
- Start with stores and core components
- Test each component after migration
- Keep backup of working state
- Migrate in small, testable chunks

### 2. Backward Compatibility
- Maintain store subscribe methods during transition
- Keep both old and new patterns temporarily
- Use feature flags for gradual rollout

### 3. Error Handling
- Add comprehensive error boundaries
- Log migration issues for debugging
- Provide fallbacks for failed migrations

### 4. Performance Considerations
- Monitor bundle size changes
- Test performance after migration
- Optimize reactive statements
- Remove unused code

## Future AI Assistant Instructions

When helping with Svelte 5 upgrades:

1. **Always check current Svelte version** before suggesting patterns
2. **Test build after each major change** to catch issues early
3. **Fix TypeScript errors** as they appear - don't let them accumulate
4. **Use gradual migration approach** - don't try to convert everything at once
5. **Maintain backward compatibility** during transition periods
6. **Document all changes** for future reference
7. **Test functionality** after each component migration
8. **Focus on one pattern at a time** (props, then events, then reactivity)

## Resources

- [Svelte 5 Migration Guide](https://svelte.dev/docs/svelte/v5-migration-guide)
- [Svelte 5 Runes Documentation](https://svelte.dev/docs/svelte/runes)
- [SvelteKit 2.0 Migration](https://svelte.dev/docs/kit/migrating-to-sveltekit-2)

---

**Status**: Application successfully building and running with hybrid Svelte 4/5 patterns. Ready for full Svelte 5 runes implementation when dependencies are properly installed.
