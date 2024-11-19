<script module>
  export const GeneralTabId = -1;
  export const BorderTabId = 0;
</script>

<script lang="ts">
  import type { WidgetInstance } from '$lib/widget-instance';
  import { ListBox, ListBoxItem, RangeSlider, Tab, TabGroup } from '@skeletonlabs/skeleton';
  import NumberInput from './number-input.svelte';
  import * as m from '$i18n/messages';
  import { WidgetMeasurementUnits } from '$lib/widget-settings';
  import FilterSelector from './filter-selector.svelte';
  import ColorPicker, { ColorPickerLayout } from './color-picker.svelte';
  import type { InternalAssetsManager } from '$lib/internal-assets-manager';

  let {
    widget,
    workspace,
    internalAssetsManager,
  }: { widget: WidgetInstance; workspace: HTMLElement; internalAssetsManager: InternalAssetsManager } = $props();

  let currentTabId: number = $state(GeneralTabId);

  let widgetSettings = $derived(widget.settings);
  let widgetPosition = $derived(widgetSettings.position);

  let tabs: { id: number; title: () => string }[] = $state([]);

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

<!-- svelte-ignore a11y_consider_explicit_label -->
<TabGroup>
  <Tab bind:group={currentTabId} name="tabCommon" value={GeneralTabId}>{m.Widgets_Common_Settings_Tabs_General()}</Tab>
  <Tab bind:group={currentTabId} name="tabCommon" value={BorderTabId}>{m.Widgets_Common_Settings_Tabs_Border()}</Tab>
  {#each tabs as tab (tab.id)}
    <Tab bind:group={currentTabId} name="tabCommon" value={tab.id}>{tab.title()}</Tab>
  {/each}
  <svelte:fragment slot="panel">
    <div class="overflow-auto max-h-[calc(100cqh-92px)]">
      {#await widget.components.settings.component.value then SettingsComponent}
        <SettingsComponent
          id={widget.id}
          settings={widget.settings.extra}
          tab={currentTabId}
          {internalAssetsManager}
          bind:tabs />
      {/await}
      {#if currentTabId === GeneralTabId}
        <div class="flex flex-row gap-4 content-center">
          <div class="label mb-2 text-center">
            <span>{m.Widgets_Common_Settings_Anchor()}</span>
            <div class="grid gap-1 grid-cols-3 grid-rows-3 w-fit h-fit">
              <button
                class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
                onclick={() => setAnchor(0, 0)}
                class:!variant-filled-primary={widgetPosition.offsetX.value === 0 &&
                  widgetPosition.offsetY.value === 0}>
                <span class="w-6 h-6 icon-[mdi--arrow-top-left]"></span>
              </button>
              <button
                class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
                onclick={() => setAnchor(50, 0)}
                class:!variant-filled-primary={widgetPosition.offsetX.value === 50 &&
                  widgetPosition.offsetY.value === 0}>
                <span class="w-6 h-6 icon-[mdi--arrow-top]"></span>
              </button>
              <button
                class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
                onclick={() => setAnchor(100, 0)}
                class:!variant-filled-primary={widgetPosition.offsetX.value === 100 &&
                  widgetPosition.offsetY.value === 0}>
                <span class="w-6 h-6 icon-[mdi--arrow-top-right]"></span>
              </button>

              <button
                class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
                onclick={() => setAnchor(0, 50)}
                class:!variant-filled-primary={widgetPosition.offsetX.value === 0 &&
                  widgetPosition.offsetY.value === 50}>
                <span class="w-6 h-6 icon-[mdi--arrow-left]"></span>
              </button>
              <button
                class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
                onclick={() => setAnchor(50, 50)}
                class:!variant-filled-primary={widgetPosition.offsetX.value === 50 &&
                  widgetPosition.offsetY.value === 50}>
                <span class="w-6 h-6 icon-[material-symbols--align-flex-center]"></span>
              </button>
              <button
                class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
                onclick={() => setAnchor(100, 50)}
                class:!variant-filled-primary={widgetPosition.offsetX.value === 100 &&
                  widgetPosition.offsetY.value === 50}>
                <span class="w-6 h-6 icon-[mdi--arrow-right]"></span>
              </button>

              <button
                class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
                onclick={() => setAnchor(0, 100)}
                class:!variant-filled-primary={widgetPosition.offsetX.value === 0 &&
                  widgetPosition.offsetY.value === 100}>
                <span class="w-6 h-6 icon-[mdi--arrow-bottom-left]"></span>
              </button>
              <button
                class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
                onclick={() => setAnchor(50, 100)}
                class:!variant-filled-primary={widgetPosition.offsetX.value === 50 &&
                  widgetPosition.offsetY.value === 100}>
                <span class="w-6 h-6 icon-[mdi--arrow-bottom]"></span>
              </button>
              <button
                class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
                onclick={() => setAnchor(100, 100)}
                class:!variant-filled-primary={widgetPosition.offsetX.value === 100 &&
                  widgetPosition.offsetY.value === 100}>
                <span class="w-6 h-6 icon-[mdi--arrow-bottom-right]"></span>
              </button>
            </div>
          </div>
          <div class="label mb-4 text-center">
            <span>{m.Widgets_Common_Settings_PositionUnit()}</span>
            <div class="w-20">
              <ListBox active="variant-filled-primary">
                <ListBoxItem
                  group={widgetPosition.positionUnits.value}
                  name="Widget_{widgetSettings.id}_PositionUnits"
                  value={WidgetMeasurementUnits.Scale}
                  on:change={() => setPositionUnits(WidgetMeasurementUnits.Scale)}>
                  {m.Widgets_Common_Settings_PositionUnit_Scale()}
                </ListBoxItem>
                <ListBoxItem
                  group={widgetPosition.positionUnits.value}
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
                  group={widgetPosition.sizeUnits.value}
                  name="Widget_{widgetSettings.id}_SizeUnits"
                  value={WidgetMeasurementUnits.Scale}
                  on:change={() => setSizeUnits(WidgetMeasurementUnits.Scale)}>
                  {m.Widgets_Common_Settings_SizeUnit_Scale()}
                </ListBoxItem>
                <ListBoxItem
                  group={widgetPosition.sizeUnits.value}
                  name="Widget_{widgetSettings.id}_SizeUnits"
                  value={WidgetMeasurementUnits.Fixed}
                  on:change={() => setSizeUnits(WidgetMeasurementUnits.Fixed)}>
                  {m.Widgets_Common_Settings_SizeUnit_Fixed()}
                </ListBoxItem>
              </ListBox>
            </div>
          </div>
        </div>
        <label class="label mb-2">
          <span>{m.Widgets_Common_Settings_ZIndex()}</span>
          <NumberInput
            placeholder={m.Widgets_Common_Settings_ZIndex()}
            bind:value={widgetSettings.zIndex.value}
            min={-999}
            max={999} />
        </label>
        <label class="label">
          <span>{m.Widgets_Common_Settings_Filter()}</span>
          <FilterSelector bind:filter={widgetSettings.filter.value} />
        </label>
      {:else if currentTabId === BorderTabId}
        <label class="label mb-2">
          <span>{m.Widgets_Common_Settings_BorderSize()}</span>
          <RangeSlider name="borderSizeSlider" bind:value={widgetSettings.borderSize.value} min={0} max={10} step={0.1}
          ></RangeSlider>
        </label>
        <label class="label mb-2">
          <span>{m.Widgets_Common_Settings_BorderColor()}</span>
          <ColorPicker bind:color={widgetSettings.borderColor.value} layout={ColorPickerLayout.InputPopup} />
        </label>
        <label class="label mb-2">
          <span>{m.Widgets_Common_Settings_BorderRadius()}</span>
          <RangeSlider
            name="borderRadiusSlider"
            bind:value={widgetSettings.borderRadius.value}
            min={0}
            max={50}
            step={0.5}></RangeSlider>
        </label>
      {/if}
    </div>
  </svelte:fragment>
</TabGroup>
