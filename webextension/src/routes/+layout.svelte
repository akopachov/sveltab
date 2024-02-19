<script lang="ts">
  import { colorScheme } from '$actions/color-scheme';
  import { setupCacheHouseKeeping } from '$stores/cache';
  import { initLocaleStore, locale } from '$stores/locale';
  import '../app.pcss';
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
  <script>
    (function () {
      const plain = localStorage.getItem('FontSource_preload');
      if (plain) {
        for (const src of plain.split(';')) {
          document.write(`<link rel="preload" href="${src}" as="font" type="font/woff2" crossorigin />`);
        }
      }
    })();
    (function () {
      const preferedColorScheme = localStorage.getItem('preferedColorScheme') || 'auto';
      const elemHtmlClasses = document.documentElement.classList;
      const classDark = 'dark';
      if (preferedColorScheme === 'auto') {
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        if (mql.matches) {
          elemHtmlClasses.add(classDark);
        } else {
          elemHtmlClasses.remove(classDark);
        }
      } else if (preferedColorScheme === 'dark') {
        elemHtmlClasses.add(classDark);
      } else {
        elemHtmlClasses.remove(classDark);
      }
    })();
  </script>
</svelte:head>

<svelte:document use:colorScheme />
{#key $locale}
  <slot />
{/key}
<Modal />
<Toast />
