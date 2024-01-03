<script lang="ts">
  import type { WidgetInstance } from '$lib/widget-instance';
  import { getModalStore, popup, type PopupSettings } from '@skeletonlabs/skeleton';
  import { SvelteComponent, createEventDispatcher } from 'svelte';
  import * as m from '$i18n/messages';
  import type { WidgetSettingsExtra } from '$lib/widget-settings';

  export let widget: WidgetInstance;
  export let widgetSettingsPopupSettings: PopupSettings;
  export let isSelected: boolean;
  export let workspaceLocked: boolean;

  type WidgetComponent = SvelteComponent & {
    onDelete?: () => void | Promise<void>;
    settings?: WidgetSettingsExtra;
    id?: string;
  };

  const dispatch = createEventDispatcher();
  const modalStore = getModalStore();
  let fakeEditButton: HTMLElement;
  let widgetComponent: WidgetComponent;

  const {
    zIndex,
    borderRadius,
    rotation,
    filter,
    position: { width, height, sizeUnits, positionUnits, x, y, offsetX, offsetY },
  } = widget.settings;

  function onDeleteWidgetClick() {
    modalStore.trigger({
      type: 'confirm',
      title: m.Widgets_Common_Menu_Delete_Confirm_Title(),
      body: m.Widgets_Common_Menu_Delete_Confirm_Body(),
      response: async (confirmed: boolean) => {
        if (confirmed) {
          if (widgetComponent.onDelete) {
            await widgetComponent.onDelete();
          }
          dispatch('delete', widget);
        }
      },
    });
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="absolute [container-type:size] relative-position {$$restProps.class ||
    ''} focus-within:!z-[99999] focus:!z-[99999]"
  id={$$restProps.id || ''}
  tabindex="-1"
  on:mousedown
  style:z-index={$zIndex}
  style:--relative-width="{$width}{$sizeUnits}"
  style:--relative-height="{$height}{$sizeUnits}"
  style:--relative-y="{$y}{$positionUnits}"
  style:--relative-x="{$x}{$positionUnits}"
  style:--relative-offset-y="{$offsetY}cqh"
  style:--relative-offset-x="{$offsetX}cqw"
  style:--relative-origin-y={$offsetY / 100}
  style:--relative-origin-x={$offsetX / 100}
  style:transform="rotate({$rotation}deg)">
  <div style:border-radius="{$borderRadius}cqmin" class="block w-full h-full overflow-hidden">
    {#await widget.components.widget.getValue()}
      <div class="w-full !h-full placeholder animate-pulse !rounded-[inherit]" />
    {:then component}
      <div class="w-full h-full rounded-[inherit]" style:filter={$filter ? `url('#${$filter}')` : ''}>
        <svelte:component
          this={component}
          bind:this={widgetComponent}
          settings={widget.settings.extra}
          id={widget.id} />
      </div>
    {/await}
  </div>
  <div
    class="absolute top-0 left-0 w-full h-full invisible pointer-events-none"
    bind:this={fakeEditButton}
    use:popup={widgetSettingsPopupSettings}>
  </div>
  <div class="absolute top-0 left-0 w-full h-full cursor-move" class:hidden={workspaceLocked}></div>
  {#if isSelected}
    <button
      class="absolute btn-icon variant-filled-surface top-0 left-0 w-8 min-w-[16px] max-w-[32px] rounded-none z-10"
      title={m.Widgets_Common_Menu_OpenSettings()}
      on:click={() => fakeEditButton.click()}>
      <span class="w-full h-full icon-[fluent--settings-20-regular]"></span>
    </button>
    <button
      class="absolute btn-icon variant-filled-error right-0 top-0 w-8 min-w-[16px] max-w-[32px] rounded-none z-10"
      title={m.Widgets_Common_Menu_Delete()}
      on:click={onDeleteWidgetClick}>
      <span class="w-full h-full icon-[fluent--delete-28-regular]"></span>
    </button>
  {/if}
</div>

<style>
  .relative-position {
    left: calc(var(--relative-offset-x) + var(--relative-x) - (var(--relative-width) * var(--relative-origin-x)));
    top: calc(var(--relative-offset-y) + var(--relative-y) - (var(--relative-height) * var(--relative-origin-y)));
    width: var(--relative-width);
    height: var(--relative-height);
  }
</style>
