<script lang="ts">
  import type { WidgetInstance } from '$lib/widget-instance';
  import { getModalStore, popup, type PopupSettings } from '@skeletonlabs/skeleton';
  import * as m from '$i18n/messages';
  import { offset, flip, shift } from 'svelte-floating-ui/dom';
  import { createFloatingActions } from 'svelte-floating-ui';
  import type { WidgetComponentExports } from '$widgets/types';
  import type { InternalAssetsManager } from '$lib/internal-assets-manager';
  import { rolledInput } from '$actions/rolled-input';

  let {
    widget,
    widgetSettingsPopupSettings,
    showControls,
    workspaceLocked,
    controlsClassName = '',
    class: exClass,
    internalAssetsManager,
    delete: onDelete,
    onautosettingsupdate,
    dirtyWidth = $bindable(),
    dirtyHeight = $bindable(),
    dirtyRotation = $bindable(),
    ...restProps
  }: {
    widget: WidgetInstance;
    widgetSettingsPopupSettings: PopupSettings;
    showControls: boolean;
    workspaceLocked: boolean;
    controlsClassName: string;
    class: string;
    internalAssetsManager: InternalAssetsManager;
    delete: (widget: WidgetInstance) => void;
    onautosettingsupdate: () => void;
    dirtyWidth?: number;
    dirtyHeight?: number;
    dirtyRotation?: number;
    [key: string]: unknown;
  } = $props();

  const modalStore = getModalStore();
  let fakeEditButton: HTMLElement | undefined = $state();
  let widgetComponent: WidgetComponentExports | undefined = $state();

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

  const [widthFloatingRef, widthFloatingContent] = createFloatingActions({
    strategy: 'absolute',
    placement: 'bottom',
    middleware: [offset({ mainAxis: 5, crossAxis: 0 }), flip(), shift()],
  });

  const [heightFloatingRef, heightFloatingContent] = createFloatingActions({
    strategy: 'absolute',
    placement: 'right',
    middleware: [offset({ mainAxis: 5, crossAxis: 0 }), flip(), shift()],
  });

  const [rotationFloatingRef, rotationFloatingContent] = createFloatingActions({
    strategy: 'absolute',
    placement: 'top',
    middleware: [offset({ mainAxis: 48, crossAxis: 0 }), shift()],
  });

  let widgetSettings = $derived(widget.settings);
  let widgetPosition = $derived(widgetSettings.position);

  function onDeleteWidgetClick() {
    modalStore.trigger({
      type: 'confirm',
      title: m.Widgets_Common_Menu_Delete_Confirm_Title(),
      body: m.Widgets_Common_Menu_Delete_Confirm_Body(),
      backdropClasses: '!z-[9999999]',
      response: async (confirmed: boolean) => {
        if (confirmed && widgetComponent) {
          if (widgetComponent.onDelete) {
            await widgetComponent.onDelete();
          }
          onDelete(widget);
        }
      },
    });
  }

  function onWidgetSettingsCLick() {
    setTimeout(() => fakeEditButton?.click(), 150); // Hack for latest @skeletonlabs/skeleton to force it to do not instantly close popup
  }
</script>

<!-- svelte-ignore -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  use:settingsFloatingRef
  use:deleteFloatingRef
  use:widthFloatingRef
  use:heightFloatingRef
  use:rotationFloatingRef
  class="absolute [container-type:size] relative-position {exClass || ''} focus-within:!z-[99999] focus:!z-[99999]"
  id={widget.htmlElementId}
  tabindex="-1"
  {...restProps}
  style:z-index={widgetSettings.zIndex.value}
  style:--relative-width="{widgetPosition.width.value}{widgetPosition.sizeUnits.value}"
  style:--relative-height="{widgetPosition.height.value}{widgetPosition.sizeUnits.value}"
  style:--relative-y="{widgetPosition.y.value}{widgetPosition.positionUnits.value}"
  style:--relative-x="{widgetPosition.x.value}{widgetPosition.positionUnits.value}"
  style:--relative-offset-y="{widgetPosition.offsetY.value}cqh"
  style:--relative-offset-x="{widgetPosition.offsetX.value}cqw"
  style:--relative-origin-y={widgetPosition.offsetY.value / 100}
  style:--relative-origin-x={widgetPosition.offsetX.value / 100}
  style:--st-rotation="rotate({widgetSettings.rotation.value}deg)"
  style:--st-border-radius="{widgetSettings.borderRadius.value}cqmin"
  style:--st-border-color={widgetSettings.borderColor.value}
  style:--st-border-size="{widgetSettings.borderSize.value}cqmin">
  {#await widget.components.widget.value then ConcreteWidgetComponent}
    <div
      class="block w-full h-full overflow-hidden rounded-[var(--st-border-radius)] {widgetComponent?.overrideBorder !==
      true
        ? 'border-[color:var(--st-border-color)] [border-width:var(--st-border-size)]'
        : ''}">
      <div
        class="w-full h-full rounded-[calc(var(--st-border-radius)-var(--st-border-size))]"
        style:filter={widgetSettings.filter.value ? `url('#${widgetSettings.filter.value}')` : ''}>
        <ConcreteWidgetComponent
          bind:this={widgetComponent}
          settings={widget.settings.extra}
          id={widget.id}
          {internalAssetsManager}
          {onautosettingsupdate} />
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
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <button
      class="btn-icon variant-filled-surface rounded-none w-full h-full btn_widget-settings"
      title={m.Widgets_Common_Menu_OpenSettings()}
      onclick={onWidgetSettingsCLick}>
      <span class="w-full h-full icon-[fluent--settings-20-regular]"></span>
    </button>
  </div>
  <div
    use:deleteFloatingContent
    class="absolute w-8 h-8 min-w-[16px] max-w-[32px] min-h-[16px] max-h-[32px] {controlsClassName} z-[99999]">
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <button
      class="{controlsClassName} btn-icon variant-filled-error rounded-none w-full h-full btn_widget-delete"
      title={m.Widgets_Common_Menu_Delete()}
      onclick={onDeleteWidgetClick}>
      <span class="w-full h-full icon-[fluent--delete-28-regular]"></span>
    </button>
  </div>
  {#if dirtyWidth !== undefined}
    <div use:widthFloatingContent class="absolute w-fit h-5 {controlsClassName} z-[99999]">
      <input
        style:width="{(dirtyWidth || 1).toString().length + 2}ch"
        type="number"
        class="text-xs py-1 px-0 block leading-none no-spinner h-full bg-[#4af] text-white border-none text-center focus:!outline-0 focus:![box-shadow:none] {controlsClassName}"
        bind:value={dirtyWidth}
        step={1}
        min={1} />
    </div>
  {/if}
  {#if dirtyHeight !== undefined}
    <div use:heightFloatingContent class="absolute w-fit h-5 {controlsClassName} z-[99999]">
      <input
        style:width="{(dirtyHeight || 1).toString().length + 2}ch"
        type="number"
        class="text-xs py-1 px-0 block leading-none no-spinner h-full bg-[#4af] text-white border-none text-center focus:!outline-0 focus:![box-shadow:none] {controlsClassName}"
        bind:value={dirtyHeight}
        step={1}
        min={1} />
    </div>
  {/if}
  {#if dirtyRotation !== undefined}
    <div use:rotationFloatingContent class="absolute w-fit h-5 {controlsClassName} z-[99999]">
      <input
        use:rolledInput
        style:width="{(dirtyRotation || 1).toString().length + 2}ch"
        type="number"
        class="text-xs py-1 px-0 block leading-none no-spinner h-full bg-[#4af] text-white border-none text-center focus:!outline-0 focus:![box-shadow:none] {controlsClassName}"
        bind:value={dirtyRotation}
        step={1}
        min={0}
        max={359} />
    </div>
  {/if}
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
