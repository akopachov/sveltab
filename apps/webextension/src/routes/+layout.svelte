<script lang="ts">
  import { colorScheme } from '$actions/color-scheme';
  import { setupCacheHouseKeeping } from '$stores/cache';
  import { initLocaleStore, locale } from '$stores/locale';
  import '../app.pcss';
  import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
  import { Modal, Toast, initializeStores, storePopup } from '@skeletonlabs/skeleton';
  import * as m from '$i18n/messages';
  import { browser } from '$app/environment';

  setupCacheHouseKeeping();
  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
  initializeStores();
  initLocaleStore();

  $effect(() => {
    if (browser) {
      document.documentElement.lang = $locale;
    }
  });
</script>

<svelte:head>
  {#key $locale}
    <title>{m.Core_Page_Title()}</title>
  {/key}
</svelte:head>

<svelte:document use:colorScheme />
{#key $locale}
  <slot />
{/key}
<Modal />
<Toast />
