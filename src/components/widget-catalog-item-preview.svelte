<script lang="ts">
  import type { WidgetCatalogItem } from '$stores/widgets-catalog';

  export let widgetCatalogItem: WidgetCatalogItem;

  let { class: exClass, ...otherProps } = $$restProps;
</script>

<button
  class="card card-hover overflow-hidden flex flex-col variant-filled-surface {exClass || ''}"
  on:click
  on:dragstart
  on:dragend
  {...otherProps}>
  <header class="overflow-hidden h-full">
    <div class="h-full w-full p-2 [&>*]:h-full [&>*]:w-full">
      {#await widgetCatalogItem.previewImage.getValue() then image}
        {@html image}
      {/await}
    </div>
  </header>
  <h4 class="text-center">{widgetCatalogItem.name()}</h4>
</button>
