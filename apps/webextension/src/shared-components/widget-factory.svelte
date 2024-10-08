<script lang="ts">
  import type { WidgetInstance } from '$lib/widget-instance';
  import { getModalStore, popup, type PopupSettings } from '@skeletonlabs/skeleton';
  import { SvelteComponent, createEventDispatcher } from 'svelte';
  import * as m from '$i18n/messages';
  import type { WidgetSettingsExtra } from '$lib/widget-settings';
  import { offset, flip, shift } from 'svelte-floating-ui/dom';
  import { createFloatingActions } from 'svelte-floating-ui';

  export let widget: WidgetInstance;
  export let widgetSettingsPopupSettings: PopupSettings;
  export let showControls: boolean;
  export let workspaceLocked: boolean;
  export let controlsClassName: string = '';

  type WidgetComponent = SvelteComponent & {
    onDelete?: () => void | Promise<void>;
    settings?: WidgetSettingsExtra;
    id?: string;
    overrideBorder?: boolean;
  };

  const dispatch = createEventDispatcher();
  const modalStore = getModalStore();
  let fakeEditButton: HTMLElement;
  let widgetComponent: WidgetComponent;

  const [settingsFloatingRef, settingsFloatingContent] = createFloatingActions({
    strategy: 'absolute',
    placement: 'top-start',
    middleware: [offset(0), flip(), shift()],
  });

  const [deleteFloatingRef, deleteFloatingContent] = createFloatingActions({
    strategy: 'absolute',
    placement: 'top-end',
    middleware: [offset({ mainAxis: 0, crossAxis: -1 }), flip(), shift()],
  });

  const {
    zIndex,
    borderRadius,
    borderColor,
    borderSize,
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
  use:settingsFloatingRef
  use:deleteFloatingRef
  class="absolute [container-type:size] relative-position {$$restProps.class ||
    ''} focus-within:!z-[99999] focus:!z-[99999]"
  id={widget.htmlElementId}
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
  style:--st-rotation="rotate({$rotation}deg)"
  style:--st-border-radius="{$borderRadius}cqmin"
  style:--st-border-color={$borderColor}
  style:--st-border-size="{$borderSize}cqmin">
  {#await widget.components.widget.value then component}
    <div
      class="block w-full h-full overflow-hidden rounded-[var(--st-border-radius)] {widgetComponent?.overrideBorder !==
      true
        ? 'border-[color:var(--st-border-color)] [border-width:var(--st-border-size)]'
        : ''}">
      <div
        class="w-full h-full rounded-[calc(var(--st-border-radius)-var(--st-border-size))]"
        style:filter={$filter ? `url('#${$filter}')` : ''}>
        <svelte:component
          this={component}
          bind:this={widgetComponent}
          settings={widget.settings.extra}
          id={widget.id}
          on:autosettingsupdate />
      </div>
    </div>
  {/await}
  {#if !workspaceLocked}
    <div
      class="absolute top-0 left-0 w-full h-full invisible pointer-events-none"
      bind:this={fakeEditButton}
      use:popup={widgetSettingsPopupSettings}>
    </div>
    <div class="absolute top-0 left-0 w-full h-full cursor-move"></div>
  {/if}
</div>
{#if showControls}
  <div
    use:settingsFloatingContent
    class="absolute w-8 h-8 min-w-[16px] max-w-[32px] min-h-[16px] max-h-[32px] {controlsClassName} z-[99999]">
    <button
      class="btn-icon variant-filled-surface rounded-none w-full h-full"
      title={m.Widgets_Common_Menu_OpenSettings()}
      on:click={() => fakeEditButton.click()}>
      <span class="w-full h-full icon-[fluent--settings-20-regular]"></span>
    </button>
  </div>
  <div
    use:deleteFloatingContent
    class="absolute w-8 h-8 min-w-[16px] max-w-[32px] min-h-[16px] max-h-[32px] {controlsClassName} z-[99999]">
    <button
      class="{controlsClassName} btn-icon variant-filled-error rounded-none w-full h-full"
      title={m.Widgets_Common_Menu_Delete()}
      on:click={onDeleteWidgetClick}>
      <span class="w-full h-full icon-[fluent--delete-28-regular]"></span>
    </button>
  </div>
{/if}

<style>
  .relative-position:not(.selected) {
    transform: translate3d(
        calc(var(--relative-offset-x) + var(--relative-x) - (var(--relative-width) * var(--relative-origin-x))),
        calc(var(--relative-offset-y) + var(--relative-y) - (var(--relative-height) * var(--relative-origin-y))),
        0
      )
      var(--st-rotation);
    width: var(--relative-width);
    height: var(--relative-height);
  }
</style>
