<script lang="ts">
  import '../app.pcss';
  import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
  import { Modal, initializeStores, storePopup } from '@skeletonlabs/skeleton';

  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
  initializeStores();
</script>

<slot />
<Modal />
