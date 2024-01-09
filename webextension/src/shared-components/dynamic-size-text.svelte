<script lang="ts">
  import { onMount } from 'svelte';

  export let text: string;
  export function refresh() {
    cropSVG();
  }

  $: {
    text && setTimeout(() => cropSVG(), 0);
  }

  let svgEl: SVGGraphicsElement;

  function cropSVG() {
    if (svgEl) {
      const bbox = svgEl.getBBox({ fill: false, clipped: true });
      svgEl.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
    }
  }

  onMount(() => cropSVG());
</script>

<svg
  bind:this={svgEl}
  preserveAspectRatio="xMinYMid meet"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  {...$$restProps}>
  <text x="0" y="100" font-size="100" fill="currentColor" text-rendering="optimizeLegibility">
    {text}
  </text>
</svg>
