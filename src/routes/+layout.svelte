<script lang="ts">
  import { initLocaleStore } from '$stores/locale';
  import '../app.pcss';
  import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
  import { Modal, initializeStores, storePopup } from '@skeletonlabs/skeleton';
  import { autoModeWatcher } from '@skeletonlabs/skeleton';

  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
  initializeStores();
  initLocaleStore();
</script>

<svelte:head>{@html `<script>${autoModeWatcher.toString()} autoModeWatcher();</script>`}</svelte:head>

<slot />
<Modal />
