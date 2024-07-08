<script lang="ts">
  export let value: number | undefined;
  export let min: number | undefined = undefined;
  export let max: number | undefined = undefined;
  export let step: number = 1;

  const { placeholder, class: exClass } = $$restProps;

  function inc() {
    let v = value || 0;
    v += step;
    if (max === undefined || v <= max) {
      value = v;
    }
  }

  function dec() {
    let v = value || 0;
    v -= step;
    if (min === undefined || v >= min) {
      value = v;
    }
  }
</script>

<div class="input-group grid-cols-[auto_1fr_auto] {exClass || ''}">
  <button class="variant-soft !pl-2 !pr-2" on:click={dec}>
    <span class="w-6 h-6 icon-[ic--baseline-minus]"></span>
  </button>
  <input class="no-spinner text-center !min-w-0" type="number" bind:value {min} {max} {placeholder} {step} />
  <button class="variant-soft !pl-2 !pr-2" on:click={inc}>
    <span class="w-6 h-6 icon-[ic--baseline-plus]"></span>
  </button>
</div>

<style>
  .no-spinner::-webkit-outer-spin-button,
  .no-spinner::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .no-spinner {
    -moz-appearance: textfield;
  }
</style>
