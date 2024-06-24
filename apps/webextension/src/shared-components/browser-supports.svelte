<script lang="ts" context="module">
  import { Lazy } from '$lib/lazy';
  import { Opfs } from '$lib/opfs';
  import { onMount } from 'svelte';
  import * as m from '$i18n/messages';

  export enum Constraints {
    OPFS = 'opfs',
  }

  const ConstraintChecks = {
    [Constraints.OPFS]: new Lazy(() => Opfs.isAvailable()),
  };
</script>

<script lang="ts">
  export let constraint: Constraints;
  let isSupported: boolean;
  const { class: exClass, ...otherProps } = $$restProps;

  onMount(async () => {
    isSupported = await ConstraintChecks[constraint].value;
  });
</script>

{#if isSupported}
  <slot />
{:else}
  <div class="bg-warning-100 border-warning-500 p-2 rounded {exClass || ''}" {...otherProps}>
    <p class="text-sm text-warning-900 text-center">{m.BrowserSupports_NotSupported()}</p>
  </div>
{/if}
