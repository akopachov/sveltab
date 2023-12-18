<script context="module">
  export const GeneralTabId = 0;
</script>

<script lang="ts">
  import type { WidgetInstance } from '$models/widget-instance';
  import { ProgressRadial, RadioGroup, RadioItem, RangeSlider, Tab, TabGroup } from '@skeletonlabs/skeleton';
  import NumberInput from './number-input.svelte';
  import * as m from '$i18n/messages';
  import { WidgetSizeType } from '$models/widget-settings';

  export let widget: WidgetInstance;
  export let workspace: HTMLElement;
  let widgetSettingsComponent: any;
  let currentTabId: any = GeneralTabId;

  $: widgetSettings = widget.settings;
  $: widgetPosition = widgetSettings.position;
  $: tabs = widget.components.settings.tabs;

  function setAnchor(offsetX: number, offsetY: number) {
    $widgetPosition.updateMeasurement(workspace, { offsetX: offsetX, offsetY: offsetY });
  }

  function setSizeType(newType: WidgetSizeType) {
    $widgetPosition.updateMeasurement(workspace, { sizeType: newType });
  }
</script>

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
        <svelte:component
          this={component}
          bind:this={widgetSettingsComponent}
          settings={widget.settings.extra}
          tab={currentTabId} />
      {/await}
      {#if currentTabId === GeneralTabId}
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <div class="label mb-2">
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
        <div class="label mb-2">
          <span>{m.Widgets_Common_Settings_SizeType()}</span>
          <div class="!mt-0">
            <RadioGroup>
              <RadioItem
                group={$widgetPosition.sizeType}
                name="Widget_{widgetSettings.id}_SizeType"
                value={WidgetSizeType.Scale}
                on:change={() => setSizeType(WidgetSizeType.Scale)}>
                {m.Widgets_Common_Settings_SizeType_Scale()}
              </RadioItem>
              <RadioItem
                group={$widgetPosition.sizeType}
                name="Widget_{widgetSettings.id}_SizeType"
                value={WidgetSizeType.Fixed}
                on:change={() => setSizeType(WidgetSizeType.Fixed)}>
                {m.Widgets_Common_Settings_SizeType_Fixed()}
              </RadioItem>
            </RadioGroup>
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
          <NumberInput placeholder={m.Widgets_Common_Settings_ZIndex()} bind:value={$widgetSettings.zIndex} />
        </label>
      {/if}
    </div>
  </svelte:fragment>
</TabGroup>
