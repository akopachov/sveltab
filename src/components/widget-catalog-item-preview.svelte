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
  <header class="overflow-hidden">
    <img class="w-full max-h-fit" src={widgetCatalogItem.previewImageUri} alt={widgetCatalogItem.name()} />
  </header>
  <h4 class="text-center">{widgetCatalogItem.name()}</h4>
</button>
