<script lang="ts">
  import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
  import { nanoid } from 'nanoid/non-secure';
  import { onDestroy } from 'svelte';
  import Picker from 'vanilla-picker/csp';
  import 'vanilla-picker/dist/vanilla-picker.csp.css';

  export let color: string;
  export let inline: boolean = false;

  let pickerParent: HTMLElement;
  let popupVisible: boolean = false;
  let picker: Picker;

  $: {
    initializePicker(pickerParent);
  }

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

  onDestroy(() => {
    picker?.destroy();
    picker = null;
  });

  function initializePicker(parent: HTMLElement) {
    picker?.destroy();
    picker = null;
    if (parent) {
      picker = new Picker({
        popup: false,
        parent: parent,
        color: color,
        onChange: (c: any) => {
          color = c.hex;
        },
      });
    }
  }
</script>

{#if inline}
  <div bind:this={pickerParent}></div>
{:else}
  <button
    class="btn rounded-full !p-0 w-6 h-6 bg-contain bg-[url('/transparent-sm.png')] {$$restProps.class || ''}"
    tabindex="-1"
    use:popup={popupSettings}
    style:box-shadow="inset 0 0 0 1.5rem {color}">
  </button>
  <div
    class="card shadow-xl w-fit h-fit overflow-y-auto flex z-[99999] px-1"
    tabindex="-1"
    style:visibility={popupVisible ? 'visible' : 'hidden'}
    data-popup={popupSettings.target}>
    {#if popupVisible}
      <div bind:this={pickerParent} class="contents"></div>
    {/if}
  </div>
{/if}

<style lang="postcss">
</style>
