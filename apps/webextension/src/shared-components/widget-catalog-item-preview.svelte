<script lang="ts">
  import type { WidgetCatalogItem } from '$widgets/types';

  let {
    widgetCatalogItem,
    class: exClass,
    ...otherProps
  }: { widgetCatalogItem: WidgetCatalogItem; class: string; [key: string]: unknown } = $props();
</script>

<button
  class="btn overflow-hidden grid grid-cols-[auto_1fr] w-full h-12 variant-soft rounded-sm p-2 {exClass || ''}"
  {...otherProps}>
  <div class="h-full [&>*]:h-8 [&>*]:w-8">
    {#await widgetCatalogItem.components.preview.value then Preview}
      <Preview />
    {/await}
  </div>
  <h4 class="w-full text-center place-self-center">{widgetCatalogItem.name()}</h4>
</button>
