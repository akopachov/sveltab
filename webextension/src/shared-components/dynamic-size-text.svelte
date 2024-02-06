<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  export let text: string;
  export function refresh() {
    updateFontSize();
  }

  $: {
    text && updateFontSize();
  }

  const canvas = new OffscreenCanvas(100, 100);
  const canvasCtx = canvas.getContext('2d')!;
  let container: HTMLElement;
  let fontSize: number;
  const resizeObserver = new ResizeObserver(() => {
    updateFontSize();
  });
  const { class: exClass, ...otherProps } = $$restProps;

  function updateFontSize() {
    if (!container || !text) return;
    const containerHeight = container.clientHeight;
    const containerWidth = container.clientWidth;
    const { fontFamily, fontWeight } = getComputedStyle(container);
    canvasCtx.font = `${fontWeight} ${containerHeight}px ${fontFamily}`;
    const { width: actualWidth } = canvasCtx.measureText(text);
    if (actualWidth > containerWidth) {
      const whRatio = actualWidth / containerHeight;
      fontSize = containerWidth / whRatio;
    } else {
      fontSize = containerHeight;
    }
  }

  onMount(() => {
    resizeObserver.observe(container);
  });

  onDestroy(() => resizeObserver.unobserve(container));
</script>

<div bind:this={container} class="w-full h-full flex justify-center items-center {exClass || ''}" {...otherProps}>
  <span style:font-size="{fontSize}px" class="leading-none whitespace-nowrap">
    {text}
  </span>
</div>
