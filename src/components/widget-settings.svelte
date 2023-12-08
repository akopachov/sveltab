<script context="module">
  export const GeneralTabId = 0;
</script>

<script lang="ts">
  import type { WidgetInstance } from '$models/widget-instance';
  import { ProgressRadial, RangeSlider, Tab, TabGroup } from '@skeletonlabs/skeleton';

  export let widget: WidgetInstance;
  export let workspace: HTMLElement;
  let widgetSettingsComponent: any;
  let currentTabId: any = GeneralTabId;

  $: widgetSettings = widget.settings;
  $: widgetPosition = widgetSettings.position;
  $: tabs = widget.components.settings.tabs;

  function setAnchor(offsetX: number, offsetY: number) {
    const cqminBase = Math.min(workspace.clientWidth, workspace.clientHeight);

    const absX = (widgetPosition.x / 100) * cqminBase + (widgetPosition.offsetX / 100) * workspace.clientWidth;
    const absOffsetX = (workspace.clientWidth * offsetX) / cqminBase;
    $widgetPosition.x = (absX / cqminBase) * 100 - absOffsetX;
    $widgetPosition.offsetX = offsetX;

    const absY = (widgetPosition.y / 100) * cqminBase + (widgetPosition.offsetY / 100) * workspace.clientHeight;
    const absOffsetY = (workspace.clientHeight * offsetY) / cqminBase;
    $widgetPosition.y = (absY / cqminBase) * 100 - absOffsetY;
    $widgetPosition.offsetY = offsetY;
  }
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
      {#await widget.components.settings.component.getValue()}
        <ProgressRadial />
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
          <span>Anchor</span>
          <div class="grid gap-1 grid-cols-3 grid-rows-3 w-fit h-fit">
            <button
              class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
              on:click={() => setAnchor(0, 0)}
              class:!variant-filled-primary={$widgetPosition.offsetX === 0 && $widgetPosition.offsetY === 0}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 19.5l-15-15m0 0v11.25m0-11.25h11.25" />
              </svg>
            </button>
            <button
              class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
              on:click={() => setAnchor(50, 0)}
              class:!variant-filled-primary={$widgetPosition.offsetX === 50 && $widgetPosition.offsetY === 0}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
              </svg>
            </button>
            <button
              class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
              on:click={() => setAnchor(100, 0)}
              class:!variant-filled-primary={$widgetPosition.offsetX === 100 && $widgetPosition.offsetY === 0}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </button>

            <button
              class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
              on:click={() => setAnchor(0, 50)}
              class:!variant-filled-primary={$widgetPosition.offsetX === 0 && $widgetPosition.offsetY === 50}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" />
              </svg>
            </button>
            <button
              class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
              on:click={() => setAnchor(50, 50)}
              class:!variant-filled-primary={$widgetPosition.offsetX === 50 && $widgetPosition.offsetY === 50}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <button
              class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
              on:click={() => setAnchor(100, 50)}
              class:!variant-filled-primary={$widgetPosition.offsetX === 100 && $widgetPosition.offsetY === 50}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
              </svg>
            </button>

            <button
              class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
              on:click={() => setAnchor(0, 100)}
              class:!variant-filled-primary={$widgetPosition.offsetX === 0 && $widgetPosition.offsetY === 100}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25" />
              </svg>
            </button>
            <button
              class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
              on:click={() => setAnchor(50, 100)}
              class:!variant-filled-primary={$widgetPosition.offsetX === 50 && $widgetPosition.offsetY === 100}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>
            </button>
            <button
              class="btn btn-icon btn-icon-sm min-w-[16px] max-w-[25px] variant-soft rounded-sm"
              on:click={() => setAnchor(100, 100)}
              class:!variant-filled-primary={$widgetPosition.offsetX === 100 && $widgetPosition.offsetY === 100}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
              </svg>
            </button>
          </div>
        </div>
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
