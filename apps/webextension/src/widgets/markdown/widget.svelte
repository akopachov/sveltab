<script lang="ts">
  import type { Settings } from './settings';

  let { settings }: { settings: Settings } = $props();
</script>

<div
  class="w-full h-full p-4 overflow-hidden hover:overflow-y-auto rounded-[inherit] prose backdrop-blur-[var(--st-blur)] [-webkit-text-stroke:var(--sv-text-stroke)] [&_*:not(pre)]:text-inherit [&_*:not(pre)]:marker:text-inherit"
  style:background-color={settings.backgroundColor.value}
  style:color={settings.textColor.value}
  style:font-weight={settings.font.weight.value}
  style:--st-blur="{settings.backgroundBlur.value}px"
  style:text-shadow="{settings.textShadow.offsetX.value}cqmin {settings.textShadow.offsetY.value}cqmin {settings
    .textShadow.blur.value}cqmin
  {settings.textShadow.color.value}"
  style:font-size="{settings.font.size.value / 2}cqmin">
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html settings.html.value}
</div>
