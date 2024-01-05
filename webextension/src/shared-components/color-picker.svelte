<script lang="ts">
  import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
  import { nanoid } from 'nanoid';
  import ColorPicker from 'svelte-awesome-color-picker';

  export let color: string;
  export let inline: boolean = false;

  let popupVisible: boolean = false;

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
    state: v => (popupVisible = v.state),
  };
</script>

{#if inline}
  <div>
    <ColorPicker bind:hex={color} label="" isDialog={false} />
  </div>
{:else}
  <button
    class="btn rounded-full !p-0 w-6 h-6 bg-contain bg-[url('/transparent-sm.png')] {$$restProps.class || ''}"
    tabindex="-1"
    use:popup={popupSettings}
    style:box-shadow="inset 0 0 0 1.5rem {color}">
  </button>
  <div
    class="card shadow-xl w-fit h-fit overflow-y-auto flex z-[99999]"
    tabindex="-1"
    style:visibility={popupVisible ? 'visible' : 'hidden'}
    data-popup={popupSettings.target}>
    {#if popupVisible}
      <ColorPicker bind:hex={color} label="" isDialog={false} />
    {/if}
  </div>
{/if}

<style lang="postcss">
  :global(.color-picker) {
    --picker-width: min(max(10cqmin, 150px), 250px);
    --picker-height: min(max(10cqmin, 150px), 250px);
  }
</style>
