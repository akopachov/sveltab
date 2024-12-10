<script lang="ts">
  import type { TextStrokeSettings } from '$lib/widget-settings';
  import { onDestroy, onMount } from 'svelte';
  import { textStroke } from '$actions/text-stroke';

  let {
    text,
    stroke = null,
    class: exClass,
    ...otherProps
  }: { text: string; stroke: TextStrokeSettings | null | undefined; class: string } = $props();

  export function refresh() {
    updateWHRatio();
    updateFontSize();
  }

  $effect(() => {
    if (text) {
      updateWHRatio();
      updateFontSize();
    }
  });

  const canvas = 'OffscreenCanvas' in window ? new OffscreenCanvas(1, 1) : undefined;
  const canvasCtx = canvas?.getContext('2d', { alpha: false })!;
  let container: HTMLElement;
  let textEl: HTMLElement;
  let fontSize: number = $state(0);
  let whRatio: number;

  const resizeObserver = new ResizeObserver(() => {
    if (whRatio <= 0) {
      updateWHRatio();
    }
    updateFontSize();
  });

  function updateWHRatio() {
    if (!container || !text) return;
    const containerHeight = container.clientHeight;
    if (containerHeight <= 0) {
      whRatio = 0;
      return;
    }

    if (canvasCtx) {
      const { fontFamily, fontWeight } = getComputedStyle(container);
      canvasCtx.font = `${fontWeight} ${containerHeight}px ${fontFamily}`;
      const { width: actualWidth } = canvasCtx.measureText(text);
      whRatio = actualWidth / containerHeight;
    } else {
      const fontSizeBefore = textEl.style.fontSize;
      textEl.style.fontSize = `${containerHeight}px`;
      whRatio = textEl.clientWidth / containerHeight;
      textEl.style.fontSize = fontSizeBefore;
    }
  }

  function updateFontSize() {
    if (!container || !text) {
      return;
    }
    if (whRatio <= 0) {
      fontSize = 0;
      return;
    }

    const containerHeight = container.clientHeight;
    const containerWidth = container.clientWidth;
    const newFontSize = Math.min(containerHeight, containerWidth / whRatio);
    if (Math.abs(newFontSize - fontSize) < 0.1) {
      return;
    }
    fontSize = newFontSize;
  }

  onMount(() => {
    updateWHRatio();
    updateFontSize();
    resizeObserver.observe(container);
  });

  onDestroy(() => resizeObserver.unobserve(container));
</script>

<div bind:this={container} class="w-full h-full flex justify-center items-center {exClass || ''}" {...otherProps}>
  <span
    bind:this={textEl}
    style:font-size="{fontSize}px"
    class="leading-none whitespace-nowrap [-webkit-text-stroke:var(--sv-text-stroke)]"
    use:textStroke={stroke}>
    {text}
  </span>
</div>
