<script lang="ts">
  import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
  import { nanoid } from 'nanoid/non-secure';
  import { onDestroy } from 'svelte';
  import Picker from 'vanilla-picker/csp';

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
  :global(.picker_wrapper.no_alpha .picker_alpha) {
    display: none;
  }

  :global(.picker_wrapper.no_editor .picker_editor) {
    position: absolute;
    z-index: -1;
    opacity: 0;
  }

  :global(.picker_wrapper.no_cancel .picker_cancel) {
    display: none;
  }

  :global(.picker_wrapper .picker_arrow) {
    display: none;
  }
  :global(.picker_wrapper) {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
    align-items: stretch;
    font-size: 10px;
    width: 25em;
    padding: 0.5em;
  }

  :global(.picker_wrapper button, .picker_wrapper input) {
    font-size: 1rem;
  }

  :global(.picker_wrapper > *) {
    margin: 0.5em;
  }

  :global(.picker_wrapper::before) {
    content: '';
    display: block;
    width: 100%;
    height: 0;
    order: 1;
  }

  :global(.picker_wrapper .picker_selector, .picker_wrapper .picker_slider) {
    padding: 1em;
  }

  :global(.picker_wrapper .picker_hue) {
    width: 100%;
  }

  :global(.picker_wrapper .picker_sl) {
    flex: 1 1 auto;
  }

  :global(.picker_wrapper .picker_sl::before) {
    content: '';
    display: block;
    padding-bottom: 100%;
  }

  :global(.picker_wrapper .picker_editor) {
    order: 1;
    width: 6.5rem;
  }

  :global(.picker_wrapper .picker_editor input) {
    width: 100%;
    height: 100%;
  }

  :global(.picker_wrapper .picker_sample) {
    order: 1;
    flex: 1 1 auto;
  }

  :global(.picker_wrapper .picker_cancel, .picker_wrapper .picker_done) {
    order: 1;
  }

  :global(.picker_wrapper) {
    box-sizing: border-box;
    background: #f2f2f2;
    box-shadow: 0 0 0 1px silver;
    cursor: default;
    font-family: sans-serif;
    color: #444;
    pointer-events: auto;
  }

  :global(.picker_wrapper:focus) {
    outline: none;
  }

  :global(.picker_wrapper input, .picker_wrapper button, ) {
    box-sizing: border-box;
    border: none;
    box-shadow: 0 0 0 1px silver;
    outline: none;
  }

  :global(
      .picker_wrapper button:focus,
      .picker_wrapper button:active,
      .picker_wrapper input:focus,
      .picker_wrapper input:active
    ) {
    box-shadow: 0 0 2px 1px #1e90ff;
  }

  :global(.picker_wrapper button) {
    padding: 0.4em 0.6em;
    cursor: pointer;
    background-color: #f5f5f5;
    background-image: linear-gradient(0deg, gainsboro, transparent);
  }

  :global(.picker_wrapper button:active) {
    background-image: linear-gradient(0deg, transparent, gainsboro);
  }

  :global(.picker_wrapper button:hover) {
    background-color: #fff;
  }

  :global(.picker_selector) {
    position: absolute;
    z-index: 1;
    display: block;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    border: 2px solid #fff;
    border-radius: 100%;
    box-shadow: 0 0 3px 1px #67b9ff;
    background: currentColor;
    cursor: pointer;
  }

  :global(.picker_slider .picker_selector) {
    border-radius: 2px;
  }

  :global(.picker_hue) {
    position: relative;
    background-image: linear-gradient(90deg, red, yellow, lime, cyan, blue, magenta, red);
    box-shadow: 0 0 0 1px silver;
  }

  :global(.picker_sl) {
    position: relative;
    box-shadow: 0 0 0 1px silver;
    background-image: linear-gradient(180deg, white, rgba(255, 255, 255, 0) 50%),
      linear-gradient(0deg, black, rgba(0, 0, 0, 0) 50%), linear-gradient(90deg, #808080, rgba(128, 128, 128, 0));
  }

  :global(.picker_alpha, .picker_sample) {
    position: relative;
    background:
      linear-gradient(45deg, lightgrey 25%, transparent 25%, transparent 75%, lightgrey 75%) 0 0/2em 2em,
      linear-gradient(45deg, lightgrey 25%, white 25%, white 75%, lightgrey 75%) 1em 1em/2em 2em;
    box-shadow: 0 0 0 1px silver;
  }

  :global(.picker_alpha .picker_selector, .picker_sample .picker_selector) {
    background: none;
  }

  :global(.picker_editor input) {
    font-family: monospace;
    padding: 0.2em 0.4em;
  }

  :global(.picker_sample::before) {
    content: '';
    position: absolute;
    display: block;
    width: 100%;
    height: 100%;
    background: currentColor;
  }

  :global(.picker_wrapper.popup) {
    position: absolute;
    z-index: 2;
    margin: 1.5em;
  }

  :global(
      .picker_wrapper.popup,
      .picker_wrapper.popup .picker_arrow::before,
      .picker_wrapper.popup .picker_arrow::after
    ) {
    background: #f2f2f2;
    box-shadow: 0 0 10px 1px rgba(0, 0, 0, 0.4);
  }

  :global(.picker_wrapper.popup .picker_arrow) {
    width: 3em;
    height: 3em;
    margin: 0;
  }

  :global(.picker_wrapper.popup .picker_arrow::before, .picker_wrapper.popup .picker_arrow::after) {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    z-index: -99;
  }

  :global(.picker_wrapper.popup .picker_arrow::before) {
    width: 100%;
    height: 100%;
    -webkit-transform: skew(45deg);
    transform: skew(45deg);
    -webkit-transform-origin: 0 100%;
    transform-origin: 0 100%;
  }

  :global(.picker_wrapper.popup .picker_arrow::after) {
    width: 150%;
    height: 150%;
    box-shadow: none;
  }
</style>
