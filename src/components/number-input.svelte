<script lang="ts">
  export let value: number | undefined;
  export let min: number | undefined = undefined;
  export let max: number | undefined = undefined;
  export let step: number = 1;

  const { placeholder, class: exClass } = $$restProps;

  function inc() {
    let v = value || 0;
    v += step;
    if (!max || v <= max) {
      value = v;
    }
  }

  function dec() {
    let v = value || 0;
    v -= step;
    if (!min || v >= min) {
      value = v;
    }
  }
</script>

<div class="input-group grid-cols-[auto_1fr_auto] {exClass || ''}">
  <button class="variant-soft !pl-2 !pr-2" on:click={dec}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
    </svg>
  </button>
  <input class="no-spinner text-center !min-w-0" type="number" bind:value {min} {max} {placeholder} {step} />
  <button class="variant-soft !pl-2 !pr-2" on:click={inc}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="w-6 h-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
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
