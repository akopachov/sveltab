<script lang="ts" module>
  import { Lazy } from '$lib/lazy';
  import { Opfs } from '$lib/opfs';
  import { onMount, type Snippet } from 'svelte';
  import * as m from '$i18n/messages';

  export enum Constraints {
    OPFS = 'opfs',
  }

  const ConstraintChecks = {
    [Constraints.OPFS]: new Lazy(() => Opfs.isAvailable()),
  };
</script>

<script lang="ts">
  let {
    constraint,
    class: exClass,
    children,
    ...otherProps
  }: { constraint: Constraints; class: string; children: Snippet } = $props();
  let isSupported: boolean | undefined = $state();

  onMount(async () => {
    isSupported = await ConstraintChecks[constraint].value;
  });
</script>

{#if isSupported}
  {@render children()}
{:else}
  <div class="bg-warning-100 border-warning-500 p-2 rounded {exClass || ''}" {...otherProps}>
    <p class="text-sm text-warning-900 text-center">{m.BrowserSupports_NotSupported()}</p>
  </div>
{/if}
