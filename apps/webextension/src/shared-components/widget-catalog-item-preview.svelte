<script lang="ts">
  import type { WidgetCatalogItem } from '$stores/widgets-catalog';

  export let widgetCatalogItem: WidgetCatalogItem;

  let { class: exClass, ...otherProps } = $$restProps;
</script>

<button
  class="btn overflow-hidden grid grid-cols-[auto_1fr] w-full h-12 variant-soft rounded-sm p-2 {exClass || ''}"
  on:click
  on:dragstart
  on:dragend
  {...otherProps}>
  <div class="h-full [&>*]:h-8 [&>*]:w-8">
    {#await widgetCatalogItem.components.preview.value then preview}
      <svelte:component this={preview} />
    {/await}
  </div>
  <h4 class="w-full text-center place-self-center">{widgetCatalogItem.name()}</h4>
</button>
