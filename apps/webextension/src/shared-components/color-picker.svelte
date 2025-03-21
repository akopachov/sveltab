<script lang="ts" module>
  export const enum ColorPickerLayout {
    Inline = 'inline',
    ButtonPopup = 'button-popup',
    InputPopup = 'input-popup',
  }
</script>

<script lang="ts">
  import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
  import { nanoid } from 'nanoid/non-secure';
  import ColorPickerInner from './color-picker-inner.svelte';
  import transparentSm from '$lib/assets/transparent-sm.png';
  import { onMount } from 'svelte';

  let { color = $bindable(), layout = ColorPickerLayout.InputPopup }: { color: string; layout?: ColorPickerLayout } =
    $props();

  let popupVisible: boolean = $state(false);

  let popupSettings: PopupSettings = {
    event: 'click',
    target: `popupColorPicker_${nanoid()}`,
    closeQuery: '',
    placement: 'bottom',
    middleware: {
      flip: {
        fallbackAxisSideDirection: 'start',
      },
    },
    state: v => {
      popupVisible = v.state;
    },
  };

  function onColorChanged(event: CustomEvent<{ value: string }>) {
    color = event.detail.value;
  }

  onMount(() => {
    import('vanilla-colorful/hex-input.js');
  });
</script>

{#if layout === ColorPickerLayout.Inline}
  <ColorPickerInner bind:color hexInput={true} />
{:else}
  <div
    class="card shadow-xl w-fit h-fit overflow-y-auto max-w-[100cqw] max-h-[calc(100cqh-16px)] flex z-[99999] p-1"
    tabindex="-1"
    style:visibility={popupVisible ? 'visible' : 'hidden'}
    data-popup={popupSettings.target}>
    {#if popupVisible}
      <ColorPickerInner bind:color hexInput={layout === ColorPickerLayout.ButtonPopup} />
    {/if}
  </div>

  {#if layout === ColorPickerLayout.InputPopup}
    <div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
      <div class="input-group-shim !px-2 border-r">
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button
          style:background-image="url('{transparentSm}')"
          class="btn rounded-full !p-0 w-6 h-6 bg-contain"
          tabindex="-1"
          use:popup={popupSettings}
          style:box-shadow="inset 0 0 0 1.5rem {color}">
        </button>
      </div>
      <hex-input {color} alpha="true" prefixed="true" oncolor-changed={onColorChanged}>
        <input type="text" class="w-full border-surface-500" />
      </hex-input>
    </div>
  {:else if layout === ColorPickerLayout.ButtonPopup}
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <button
      style:background-image="url('{transparentSm}')"
      class="btn rounded-full !p-0 w-6 h-6 bg-contain"
      tabindex="-1"
      use:popup={popupSettings}
      style:box-shadow="inset 0 0 0 1.5rem {color}">
    </button>
  {/if}
{/if}
