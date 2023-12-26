<script lang="ts">
  import type { WidgetInstance } from '$models/widget-instance';
  import { getModalStore, popup, type PopupSettings } from '@skeletonlabs/skeleton';
  import { SvelteComponent, createEventDispatcher } from 'svelte';
  import * as m from '$i18n/messages';
  import type { WidgetSettingsExtra } from '$models/widget-settings';

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

  $: widgetSettings = widget.settings;
  $: widgetPosition = widget.settings.position;

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
  style:z-index={$widgetSettings.zIndex}
  style:--relative-width="{$widgetPosition.width}{$widgetPosition.sizeType}"
  style:--relative-height="{$widgetPosition.height}{$widgetPosition.sizeType}"
  style:--relative-y="{$widgetPosition.y}{$widgetPosition.sizeType}"
  style:--relative-x="{$widgetPosition.x}{$widgetPosition.sizeType}"
  style:--relative-offset-y="{$widgetPosition.offsetY}cqh"
  style:--relative-offset-x="{$widgetPosition.offsetX}cqw"
  style:transform="rotate({widget.settings.rotation}deg)">
  <div style:border-radius="{$widgetSettings.borderRadius}cqmin" class="block w-full h-full overflow-hidden">
    {#await widget.components.widget.getValue()}
      <div class="w-full !h-full placeholder animate-pulse !rounded-[inherit]" />
    {:then component}
      <svelte:component this={component} bind:this={widgetComponent} settings={widgetSettings.extra} id={widget.id} />
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
    left: calc(var(--relative-offset-x) + var(--relative-x) - (var(--relative-width) / 2));
    top: calc(var(--relative-offset-y) + var(--relative-y) - (var(--relative-height) / 2));
    width: var(--relative-width);
    height: var(--relative-height);
  }
</style>
