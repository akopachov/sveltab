<script lang="ts" context="module">
  import { WeakLazy } from '$lib/lazy';
  import type { Filter } from '$stores/active-filters-store';

  const AvailableFilters: ReadonlyMap<
    Filter,
    WeakLazy<Promise<ConstructorOfATypedSvelteComponent | Component<any, any, any>>>
  > = new Map([
    ['Apollo', new WeakLazy(() => import('@skeletonlabs/skeleton').then(r => r.Apollo))],
    ['BlueNight', new WeakLazy(() => import('@skeletonlabs/skeleton').then(r => r.BlueNight))],
    ['Emerald', new WeakLazy(() => import('@skeletonlabs/skeleton').then(r => r.Emerald))],
    ['GreenFall', new WeakLazy(() => import('@skeletonlabs/skeleton').then(r => r.GreenFall))],
    ['Noir', new WeakLazy(() => import('@skeletonlabs/skeleton').then(r => r.Noir))],
    ['NoirLight', new WeakLazy(() => import('@skeletonlabs/skeleton').then(r => r.NoirLight))],
    ['Rustic', new WeakLazy(() => import('@skeletonlabs/skeleton').then(r => r.Rustic))],
    ['Summer84', new WeakLazy(() => import('@skeletonlabs/skeleton').then(r => r.Summer84))],
    ['XPro', new WeakLazy(() => import('@skeletonlabs/skeleton').then(r => r.XPro))],
  ]);
</script>

<script lang="ts">
  import { ActiveFilters } from '$stores/active-filters-store';
  import type { Component } from 'svelte';
</script>

{#each $ActiveFilters as f (f)}
  {@const filterLoader = AvailableFilters.get(f)}
  {#await filterLoader?.value then LoadedFilter}
    <LoadedFilter />
  {/await}
{/each}
