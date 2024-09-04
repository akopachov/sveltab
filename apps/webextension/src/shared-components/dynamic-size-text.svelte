<script lang="ts">
  import type { TextStrokeSettings } from '$lib/widget-settings';
  import { onDestroy, onMount } from 'svelte';
  import { textStroke } from '$actions/text-stroke';

  export let text: string;
  export let stroke: TextStrokeSettings | null | undefined = null;
  export function refresh() {
    updateWHRatio();
    updateFontSize();
  }

  $: {
    if (text) {
      updateWHRatio();
      updateFontSize();
    }
  }

  const canvas = new OffscreenCanvas(1, 1);
  const canvasCtx = canvas.getContext('2d', { alpha: false })!;
  let container: HTMLElement;
  let fontSize: number = 0;
  let whRatio: number;
  const resizeObserver = new ResizeObserver(() => {
    updateFontSize();
  });
  const { class: exClass, ...otherProps } = $$restProps;

  function updateWHRatio() {
    if (!container || !text) return;
    const containerHeight = container.clientHeight;
    const { fontFamily, fontWeight } = getComputedStyle(container);
    canvasCtx.font = `${fontWeight} ${containerHeight}px ${fontFamily}`;
    const { width: actualWidth } = canvasCtx.measureText(text);
    whRatio = actualWidth / containerHeight;
  }

  function updateFontSize() {
    if (!container || !text || whRatio <= 0) return;
    const containerHeight = container.clientHeight;
    const containerWidth = container.clientWidth;
    fontSize = Math.min(containerHeight, containerWidth / whRatio);
  }

  onMount(() => {
    updateWHRatio();
    resizeObserver.observe(container);
  });

  onDestroy(() => resizeObserver.unobserve(container));
</script>

<div bind:this={container} class="w-full h-full flex justify-center items-center {exClass || ''}" {...otherProps}>
  <span
    style:font-size="{fontSize}px"
    class="leading-none whitespace-nowrap [-webkit-text-stroke:var(--sv-text-stroke)]"
    use:textStroke={stroke}>
    {text}
  </span>
</div>
