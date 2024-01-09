<script lang="ts">
  import type { WidgetCatalogItem } from '$stores/widgets-catalog';

  export let widgetCatalogItem: WidgetCatalogItem;

  let { class: exClass, ...otherProps } = $$restProps;
</script>

<button
  class="card card-hover overflow-hidden flex flex-col variant-ghost {exClass || ''}"
  on:click
  on:dragstart
  on:dragend
  {...otherProps}>
  <header class="overflow-hidden h-full w-full">
    <div class="h-full w-full p-2 [&>*]:h-full [&>*]:w-full">
      {#await widgetCatalogItem.components.preview.getValue() then preview}
        <svelte:component this={preview} />
      {/await}
    </div>
  </header>
  <h4 class="w-full text-center">{widgetCatalogItem.name()}</h4>
</button>
