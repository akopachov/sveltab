<script lang="ts">
  import type { WidgetInstance } from '$models/widget-instance';
  import { getModalStore, popup, ProgressRadial, type PopupSettings } from '@skeletonlabs/skeleton';
  import { SvelteComponent, createEventDispatcher } from 'svelte';
  import * as m from '$i18n/messages';
  import type { WidgetSettingsExtra } from '$models/widget-settings';

  export let widget: WidgetInstance;
  export let widgetSettingsPopupSettings: PopupSettings;
  export let isSelected: boolean;

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
  class="absolute [container-type:size] relative-position {$$restProps.class || ''}"
  on:mousedown
  style:z-index={$widgetSettings.zIndex}
  style:--relative-width="{$widgetPosition.width}cqmin"
  style:--relative-height="{$widgetPosition.height}cqmin"
  style:--relative-y="{$widgetPosition.y}cqmin"
  style:--relative-x="{$widgetPosition.x}cqmin"
  style:--relative-offset-y="{$widgetPosition.offsetY}cqh"
  style:--relative-offset-x="{$widgetPosition.offsetX}cqw"
  style:transform="rotate({widget.settings.rotation}deg)">
  <div style:border-radius="{$widgetSettings.borderRadius}cqmin" class="block w-full h-full overflow-hidden">
    {#await widget.components.widget.getValue()}
      <ProgressRadial width="w-[100cqmin] ml-[auto] mr-[auto]" />
    {:then component}
      <svelte:component this={component} bind:this={widgetComponent} settings={widgetSettings.extra} id={widget.id} />
    {/await}
  </div>
  <button
    class="absolute transparent top-0 left-0 w-full h-full opacity-0 cursor-move"
    bind:this={fakeEditButton}
    use:popup={widgetSettingsPopupSettings}
    class:hidden={!isSelected}>
  </button>
  {#if isSelected}
    <button
      class="absolute btn-icon variant-filled-surface top-0 left-0 w-8 min-w-[16px] max-w-[32px] rounded-none z-10"
      title={m.Widgets_Common_Menu_OpenSettings()}
      on:click={() => fakeEditButton.click()}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-full">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>
    <button
      class="absolute btn-icon variant-filled-error right-0 top-0 w-8 min-w-[16px] max-w-[32px] rounded-none z-10"
      title={m.Widgets_Common_Menu_Delete()}
      on:click={onDeleteWidgetClick}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-6 h-6">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    </button>
  {/if}
</div>

<style>
  .relative-position {
    left: calc(var(--relative-offset-x) + var(--relative-x));
    top: calc(var(--relative-offset-y) + var(--relative-y));
    width: var(--relative-width);
    height: var(--relative-height);
  }
</style>
