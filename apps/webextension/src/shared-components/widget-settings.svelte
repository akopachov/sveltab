<script context="module">
  export const GeneralTabId = -1;
  export const BorderTabId = 0;
</script>

<script lang="ts">
  import type { WidgetInstance } from '$lib/widget-instance';
  import { ListBox, ListBoxItem, ProgressRadial, RangeSlider, Tab, TabGroup } from '@skeletonlabs/skeleton';
  import NumberInput from './number-input.svelte';
  import * as m from '$i18n/messages';
  import { WidgetMeasurementUnits } from '$lib/widget-settings';
  import FilterSelector from './filter-selector.svelte';
  import ColorPicker, { ColorPickerLayout } from './color-picker.svelte';

  export let widget: WidgetInstance;
  export let workspace: HTMLElement;
  let currentTabId: any = GeneralTabId;

  $: widgetSettings = widget.settings;
  $: widgetPosition = widgetSettings.position;
  $: widgetPositionOffsetX = widgetPosition.offsetX;
  $: widgetPositionOffsetY = widgetPosition.offsetY;
  $: widgetPositionPositionUnits = widgetPosition.positionUnits;
  $: widgetPositionSizeUnits = widgetPosition.sizeUnits;
  $: borderRadius = widgetSettings.borderRadius;
  $: borderSize = widgetSettings.borderSize;
  $: borderColor = widgetSettings.borderColor;
  $: zIndex = widgetSettings.zIndex;
  $: filter = widgetSettings.filter;

  let tabs: { id: number; title: () => string }[] = [];

  function setAnchor(offsetX: number, offsetY: number) {
    widgetPosition.updateMeasurement(workspace, { offsetX: offsetX, offsetY: offsetY });
  }

  function setSizeUnits(newUnits: WidgetMeasurementUnits) {
    widgetPosition.updateMeasurement(workspace, { sizeUnits: newUnits });
  }

  function setPositionUnits(newUnits: WidgetMeasurementUnits) {
    widgetPosition.updateMeasurement(workspace, { positionUnits: newUnits });
  }
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<TabGroup>
  <Tab bind:group={currentTabId} name="tabCommon" value={GeneralTabId}>{m.Widgets_Common_Settings_Tabs_General()}</Tab>
  <Tab bind:group={currentTabId} name="tabCommon" value={BorderTabId}>{m.Widgets_Common_Settings_Tabs_Border()}</Tab>
  {#each tabs as tab (tab.id)}
    <Tab bind:group={currentTabId} name="tabCommon" value={tab.id}>{tab.title()}</Tab>
  {/each}
  <svelte:fragment slot="panel">
    <div class="overflow-auto max-h-[calc(100cqh-92px)]">
      {#await widget.components.settings.component.value}
        <ProgressRadial width="w-12 ml-[auto] mr-[auto]" />
      {:then component}
        <svelte:component this={component} settings={widget.settings.extra} tab={currentTabId} bind:tabs />
      {/await}
      {#if currentTabId === GeneralTabId}
        <div class="flex flex-row gap-4 content-center">
          <div class="label mb-2 text-center">
            <span>{m.Widgets_Common_Settings_Anchor()}</span>
            <div class="grid gap-1 grid-cols-3 grid-rows-3 w-fit h-fit">
              <button
                class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
                on:click={() => setAnchor(0, 0)}
                class:!variant-filled-primary={$widgetPositionOffsetX === 0 && $widgetPositionOffsetY === 0}>
                <span class="w-6 h-6 icon-[mdi--arrow-top-left]"></span>
              </button>
              <button
                class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
                on:click={() => setAnchor(50, 0)}
                class:!variant-filled-primary={$widgetPositionOffsetX === 50 && $widgetPositionOffsetY === 0}>
                <span class="w-6 h-6 icon-[mdi--arrow-top]"></span>
              </button>
              <button
                class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
                on:click={() => setAnchor(100, 0)}
                class:!variant-filled-primary={$widgetPositionOffsetX === 100 && $widgetPositionOffsetY === 0}>
                <span class="w-6 h-6 icon-[mdi--arrow-top-right]"></span>
              </button>

              <button
                class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
                on:click={() => setAnchor(0, 50)}
                class:!variant-filled-primary={$widgetPositionOffsetX === 0 && $widgetPositionOffsetY === 50}>
                <span class="w-6 h-6 icon-[mdi--arrow-left]"></span>
              </button>
              <button
                class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
                on:click={() => setAnchor(50, 50)}
                class:!variant-filled-primary={$widgetPositionOffsetX === 50 && $widgetPositionOffsetY === 50}>
                <span class="w-6 h-6 icon-[material-symbols--align-flex-center]"></span>
              </button>
              <button
                class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
                on:click={() => setAnchor(100, 50)}
                class:!variant-filled-primary={$widgetPositionOffsetX === 100 && $widgetPositionOffsetY === 50}>
                <span class="w-6 h-6 icon-[mdi--arrow-right]"></span>
              </button>

              <button
                class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
                on:click={() => setAnchor(0, 100)}
                class:!variant-filled-primary={$widgetPositionOffsetX === 0 && $widgetPositionOffsetY === 100}>
                <span class="w-6 h-6 icon-[mdi--arrow-bottom-left]"></span>
              </button>
              <button
                class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
                on:click={() => setAnchor(50, 100)}
                class:!variant-filled-primary={$widgetPositionOffsetX === 50 && $widgetPositionOffsetY === 100}>
                <span class="w-6 h-6 icon-[mdi--arrow-bottom]"></span>
              </button>
              <button
                class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
                on:click={() => setAnchor(100, 100)}
                class:!variant-filled-primary={$widgetPositionOffsetX === 100 && $widgetPositionOffsetY === 100}>
                <span class="w-6 h-6 icon-[mdi--arrow-bottom-right]"></span>
              </button>
            </div>
          </div>
          <div class="label mb-4 text-center">
            <span>{m.Widgets_Common_Settings_PositionUnit()}</span>
            <div class="w-20">
              <ListBox active="variant-filled-primary">
                <ListBoxItem
                  group={$widgetPositionPositionUnits}
                  name="Widget_{widgetSettings.id}_PositionUnits"
                  value={WidgetMeasurementUnits.Scale}
                  on:change={() => setPositionUnits(WidgetMeasurementUnits.Scale)}>
                  {m.Widgets_Common_Settings_PositionUnit_Scale()}
                </ListBoxItem>
                <ListBoxItem
                  group={$widgetPositionPositionUnits}
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
                  group={$widgetPositionSizeUnits}
                  name="Widget_{widgetSettings.id}_SizeUnits"
                  value={WidgetMeasurementUnits.Scale}
                  on:change={() => setSizeUnits(WidgetMeasurementUnits.Scale)}>
                  {m.Widgets_Common_Settings_SizeUnit_Scale()}
                </ListBoxItem>
                <ListBoxItem
                  group={$widgetPositionSizeUnits}
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
          <span>{m.Widgets_Common_Settings_ZIndex()}</span>
          <NumberInput placeholder={m.Widgets_Common_Settings_ZIndex()} bind:value={$zIndex} min={-999} max={999} />
        </label>
        <label class="label">
          <span>{m.Widgets_Common_Settings_Filter()}</span>
          <FilterSelector bind:filter={$filter} />
        </label>
      {:else if currentTabId === BorderTabId}
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="label mb-2">
          <span>{m.Widgets_Common_Settings_BorderSize()}</span>
          <RangeSlider name="borderSizeSlider" bind:value={$borderSize} min={0} max={10} step={0.1}></RangeSlider>
        </label>
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="label mb-2">
          <span>{m.Widgets_Common_Settings_BorderColor()}</span>
          <ColorPicker bind:color={$borderColor} layout={ColorPickerLayout.InputPopup} />
        </label>
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="label mb-2">
          <span>{m.Widgets_Common_Settings_BorderRadius()}</span>
          <RangeSlider name="borderRadiusSlider" bind:value={$borderRadius} min={0} max={50} step={0.5}></RangeSlider>
        </label>
      {/if}
    </div>
  </svelte:fragment>
</TabGroup>
