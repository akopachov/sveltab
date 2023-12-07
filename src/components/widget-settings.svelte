<script context="module">
  export const GeneralTabId = 0;
</script>

<script lang="ts">
  import type { WidgetInstance } from '$models/widget-instance';
  import { RangeSlider, Tab, TabGroup } from '@skeletonlabs/skeleton';

  export let widget: WidgetInstance;
  let widgetSettingsComponent: any;
  let currentTabId: any = GeneralTabId;

  $: widgetSettings = widget.settings;
  $: tabs = widget.components.settings.tabs;
</script>

<TabGroup>
  <Tab bind:group={currentTabId} name="tabCommon" value={0}>General</Tab>
  {#await tabs.getValue() then resolvedTabs}
    {#each resolvedTabs as tab (tab.id)}
      <Tab bind:group={currentTabId} name="tabCommon" value={tab.id}>{tab.title}</Tab>
    {/each}
  {/await}
  <svelte:fragment slot="panel">
    <div class="overflow-scroll max-h-[calc(100cqh-92px)]">
      {#await widget.components.settings.component.getValue() then component}
        <svelte:component
          this={component}
          bind:this={widgetSettingsComponent}
          settings={widget.settings.extra}
          tab={currentTabId} />
      {/await}
      {#if currentTabId === GeneralTabId}
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="label mb-2">
          <span>Border radius</span>
          <RangeSlider name="range-slider" bind:value={$widgetSettings.borderRadius} min={0} max={50} step={0.5}
          ></RangeSlider>
        </label>
        <label class="label">
          <span>Z-Index</span>
          <input class="input pt-1 pb-1" type="number" placeholder="Z-Index" bind:value={$widgetSettings.zIndex} />
        </label>
      {/if}
    </div>
  </svelte:fragment>
</TabGroup>
