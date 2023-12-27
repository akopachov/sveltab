<script context="module">
  export const GeneralTabId = 0;
</script>

<script lang="ts">
  import type { WidgetInstance } from '$models/widget-instance';
  import { ListBox, ListBoxItem, ProgressRadial, RangeSlider, Tab, TabGroup } from '@skeletonlabs/skeleton';
  import NumberInput from './number-input.svelte';
  import * as m from '$i18n/messages';
  import { WidgetMeasurementUnits } from '$models/widget-settings';
  import FilterSelect from './filter-select.svelte';

  export let widget: WidgetInstance;
  export let workspace: HTMLElement;
  let currentTabId: any = GeneralTabId;

  $: widgetSettings = widget.settings;
  $: widgetPosition = widgetSettings.position;
  $: tabs = widget.components.settings.tabs;

  function setAnchor(offsetX: number, offsetY: number) {
    $widgetPosition.updateMeasurement(workspace, { offsetX: offsetX, offsetY: offsetY });
  }

  function setSizeUnits(newUnits: WidgetMeasurementUnits) {
    $widgetPosition.updateMeasurement(workspace, { sizeUnits: newUnits });
  }

  function setPositionUnits(newUnits: WidgetMeasurementUnits) {
    $widgetPosition.updateMeasurement(workspace, { positionUnits: newUnits });
  }
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<TabGroup>
  <Tab bind:group={currentTabId} name="tabCommon" value={0}>{m.Widgets_Common_Settings_Tabs_General()}</Tab>
  {#await tabs.getValue() then resolvedTabs}
    {#each resolvedTabs as tab (tab.id)}
      <Tab bind:group={currentTabId} name="tabCommon" value={tab.id}>{tab.title()}</Tab>
    {/each}
  {/await}
  <svelte:fragment slot="panel">
    <div class="overflow-scroll max-h-[calc(100cqh-92px)]">
      {#await widget.components.settings.component.getValue()}
        <ProgressRadial width="w-12 ml-[auto] mr-[auto]" />
      {:then component}
        <svelte:component this={component} settings={widget.settings.extra} tab={currentTabId} />
      {/await}
      {#if currentTabId === GeneralTabId}
        <div class="flex flex-row gap-4 content-center">
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <div class="label mb-2 text-center">
            <span>{m.Widgets_Common_Settings_Anchor()}</span>
            <div class="grid gap-1 grid-cols-3 grid-rows-3 w-fit h-fit">
              <button
                class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
                on:click={() => setAnchor(0, 0)}
                class:!variant-filled-primary={$widgetPosition.offsetX === 0 && $widgetPosition.offsetY === 0}>
                <span class="w-6 h-6 icon-[mdi--arrow-top-left]"></span>
              </button>
              <button
                class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
                on:click={() => setAnchor(50, 0)}
                class:!variant-filled-primary={$widgetPosition.offsetX === 50 && $widgetPosition.offsetY === 0}>
                <span class="w-6 h-6 icon-[mdi--arrow-top]"></span>
              </button>
              <button
                class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
                on:click={() => setAnchor(100, 0)}
                class:!variant-filled-primary={$widgetPosition.offsetX === 100 && $widgetPosition.offsetY === 0}>
                <span class="w-6 h-6 icon-[mdi--arrow-top-right]"></span>
              </button>

              <button
                class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
                on:click={() => setAnchor(0, 50)}
                class:!variant-filled-primary={$widgetPosition.offsetX === 0 && $widgetPosition.offsetY === 50}>
                <span class="w-6 h-6 icon-[mdi--arrow-left]"></span>
              </button>
              <button
                class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
                on:click={() => setAnchor(50, 50)}
                class:!variant-filled-primary={$widgetPosition.offsetX === 50 && $widgetPosition.offsetY === 50}>
                <span class="w-6 h-6 icon-[material-symbols--align-flex-center]"></span>
              </button>
              <button
                class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
                on:click={() => setAnchor(100, 50)}
                class:!variant-filled-primary={$widgetPosition.offsetX === 100 && $widgetPosition.offsetY === 50}>
                <span class="w-6 h-6 icon-[mdi--arrow-right]"></span>
              </button>

              <button
                class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
                on:click={() => setAnchor(0, 100)}
                class:!variant-filled-primary={$widgetPosition.offsetX === 0 && $widgetPosition.offsetY === 100}>
                <span class="w-6 h-6 icon-[mdi--arrow-bottom-left]"></span>
              </button>
              <button
                class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
                on:click={() => setAnchor(50, 100)}
                class:!variant-filled-primary={$widgetPosition.offsetX === 50 && $widgetPosition.offsetY === 100}>
                <span class="w-6 h-6 icon-[mdi--arrow-bottom]"></span>
              </button>
              <button
                class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
                on:click={() => setAnchor(100, 100)}
                class:!variant-filled-primary={$widgetPosition.offsetX === 100 && $widgetPosition.offsetY === 100}>
                <span class="w-6 h-6 icon-[mdi--arrow-bottom-right]"></span>
              </button>
            </div>
          </div>
          <div class="label mb-4 text-center">
            <span>{m.Widgets_Common_Settings_PositionUnit()}</span>
            <div class="w-20">
              <ListBox active="variant-filled-primary">
                <ListBoxItem
                  group={$widgetPosition.positionUnits}
                  name="Widget_{widgetSettings.id}_PositionUnits"
                  value={WidgetMeasurementUnits.Scale}
                  on:change={() => setPositionUnits(WidgetMeasurementUnits.Scale)}>
                  {m.Widgets_Common_Settings_PositionUnit_Scale()}
                </ListBoxItem>
                <ListBoxItem
                  group={$widgetPosition.positionUnits}
                  name="Widget_{widgetSettings.id}_PositionUnits"
                  value={WidgetMeasurementUnits.Fixed}
                  on:change={() => setPositionUnits(WidgetMeasurementUnits.Fixed)}>
                  {m.Widgets_Common_Settings_PositionUnit_Fixed()}
                </ListBoxItem>
              </ListBox>
            </div>
          </div>
          <div class="label mb-4 text-center">
            <span>{m.Widgets_Common_Settings_SizeUnit()}</span>
            <div class="w-20">
              <ListBox active="variant-filled-primary">
                <ListBoxItem
                  group={$widgetPosition.sizeUnits}
                  name="Widget_{widgetSettings.id}_SizeUnits"
                  value={WidgetMeasurementUnits.Scale}
                  on:change={() => setSizeUnits(WidgetMeasurementUnits.Scale)}>
                  {m.Widgets_Common_Settings_SizeUnit_Scale()}
                </ListBoxItem>
                <ListBoxItem
                  group={$widgetPosition.sizeUnits}
                  name="Widget_{widgetSettings.id}_SizeUnits"
                  value={WidgetMeasurementUnits.Fixed}
                  on:change={() => setSizeUnits(WidgetMeasurementUnits.Fixed)}>
                  {m.Widgets_Common_Settings_SizeUnit_Fixed()}
                </ListBoxItem>
              </ListBox>
            </div>
          </div>
        </div>
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="label mb-2">
          <span>{m.Widgets_Common_Settings_BorderRadius()}</span>
          <RangeSlider name="range-slider" bind:value={$widgetSettings.borderRadius} min={0} max={50} step={0.5}
          ></RangeSlider>
        </label>
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="label">
          <span>{m.Widgets_Common_Settings_ZIndex()}</span>
          <NumberInput
            placeholder={m.Widgets_Common_Settings_ZIndex()}
            bind:value={$widgetSettings.zIndex}
            min={-999}
            max={999} />
        </label>
      {/if}
      <label class="label">
        <span>{m.Widgets_Common_Settings_Filter()}</span>
        <FilterSelect bind:filter={$widgetSettings.filter} />
      </label>
    </div>
  </svelte:fragment>
</TabGroup>
