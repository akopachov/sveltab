<script lang="ts">
  import type { Settings } from './settings';
  import { fontsource } from '$actions/fontsource';
  import { userPosssibleLocaleCharSubset } from '$stores/locale';
  import { textStroke } from '$actions/text-stroke';

  export let settings: Settings;

  const {
    text,
    textAlign,
    backgroundColor,
    backgroundBlur,
    textColor,
    font: { id: fontId, weight: fontWeight, size: fontSize },
    textShadow: {
      offsetX: textShadowOffsetX,
      offsetY: textShadowOffsetY,
      blur: textShadowBlur,
      color: textShadowColor,
    },
    textStroke: textStrokeSettings,
  } = settings;

  $: textLines = $text.split(/\r\n|\r|\n/);
</script>

<div
  class="w-full h-full p-4 select-none flex justify-center content-center flex-col overflow-hidden hover:overflow-y-auto rounded-[inherit] backdrop-blur-[var(--st-blur)] [-webkit-text-stroke:var(--sv-text-stroke)]"
  style:background-color={$backgroundColor}
  style:color={$textColor}
  style:font-weight={$fontWeight}
  style:--st-blur="{$backgroundBlur}px"
  style:text-shadow="{$textShadowOffsetX}cqmin {$textShadowOffsetY}cqmin {$textShadowBlur}cqmin
  {$textShadowColor}"
  style:font-size="{$fontSize}cqmin"
  style:text-align={$textAlign}
  use:fontsource={{
    font: $fontId,
    subsets: $userPosssibleLocaleCharSubset,
    styles: ['normal'],
    weights: [$fontWeight],
  }}
  use:textStroke={textStrokeSettings}>
  {#each textLines as line}
    <span class="leading-none">{line}</span>
  {/each}
</div>
