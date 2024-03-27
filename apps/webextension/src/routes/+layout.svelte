<script lang="ts">
  import { colorScheme } from '$actions/color-scheme';
  import { setupCacheHouseKeeping } from '$stores/cache';
  import { initLocaleStore, locale } from '$stores/locale';
  import '../app.pcss';
  import '../../node_modules/vanilla-picker/dist/vanilla-picker.csp.css';
  import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
  import { Modal, Toast, initializeStores, storePopup } from '@skeletonlabs/skeleton';
  import * as m from '$i18n/messages';
  import { browser } from '$app/environment';

  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
  initializeStores();
  initLocaleStore();
  setupCacheHouseKeeping();

  $: {
    if (browser) {
      document.documentElement.lang = $locale;
    }
  }
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
