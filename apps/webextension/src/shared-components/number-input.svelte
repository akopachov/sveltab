<script lang="ts">
  import { onDestroy } from 'svelte';

  let {
    value = $bindable(),
    min = undefined,
    max = undefined,
    step = 1,
    class: exClass,
    placeholder,
  }: {
    value: number | undefined;
    min?: number;
    max?: number;
    step?: number;
    class?: string;
    placeholder?: string;
  } = $props();

  let timeout: ReturnType<typeof setTimeout> | undefined;
  let interval: ReturnType<typeof setInterval> | undefined;

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

  function mousedown(fn: () => void) {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      if (interval) {
        clearInterval(interval);
      }
      interval = setInterval(fn, 100);
    }, 500);
  }

  function mouseup() {
    if (timeout) {
      clearTimeout(timeout);
    }

    if (interval) {
      clearInterval(interval);
    }
  }

  onDestroy(() => {
    if (timeout) {
      clearTimeout(timeout);
    }

    if (interval) {
      clearInterval(interval);
    }
  });
</script>

<div class="input-group grid-cols-[auto_1fr_auto] {exClass || ''}">
  <!-- svelte-ignore a11y_consider_explicit_label -->
  <button class="variant-soft !pl-2 !pr-2" onclick={dec} onmousedown={() => mousedown(dec)} onmouseup={mouseup}>
    <span class="w-6 h-6 icon-[ic--baseline-minus]"></span>
  </button>
  <input class="no-spinner text-center !min-w-0" type="number" bind:value {min} {max} {placeholder} {step} />
  <!-- svelte-ignore a11y_consider_explicit_label -->
  <button class="variant-soft !pl-2 !pr-2" onclick={inc} onmousedown={() => mousedown(inc)} onmouseup={mouseup}>
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
