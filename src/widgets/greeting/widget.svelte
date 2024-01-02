<script lang="ts">
  import type { Settings } from './settings';
  import { fontsource } from '$actions/fontsource';
  import { getClockStore } from '$stores/clock-store';
  import * as m from '$i18n/messages';
  import { derived, type Readable } from 'svelte/store';
  import { localeCharSubset } from '$stores/locale';
  import { minutesToMilliseconds } from 'date-fns';

  export let settings: Settings;

  const {
    name,
    font: { id: fontId, weight: fontWeight, size: fontSize },
    textColor,
    backgroundColor,
    backgroundBlur,
    textShadow: {
      offsetX: textShadowOffsetX,
      offsetY: textShadowOffsetY,
      blur: textShadowBlur,
      color: textShadowColor,
    },
  } = settings;

  enum PartOfDay {
    Unknown,
    Morning,
    Day,
    Evening,
    Night,
  }

  let currentPartOfDay = derived<Readable<Date>, PartOfDay>(
    getClockStore(minutesToMilliseconds(1)),
    (now, set) => {
      let newPartOfTheDay = PartOfDay.Day;
      const hours = now.getHours();
      if (hours >= 4 && hours <= 12) {
        newPartOfTheDay = PartOfDay.Morning;
      } else if (hours > 12 && hours <= 18) {
        newPartOfTheDay = PartOfDay.Day;
      } else if (hours > 18 && hours <= 23) {
        newPartOfTheDay = PartOfDay.Evening;
      } else {
        newPartOfTheDay = PartOfDay.Night;
      }

      set(newPartOfTheDay);
    },
    PartOfDay.Unknown,
  );

  $: greetingTemplate = getGreetingTemplate($currentPartOfDay);

  function getGreetingTemplate(part: PartOfDay): { named: string; nameless: string } {
    let namedGreetingsPlain: string;
    let namelessGreetingsPlain: string;

    if (part === PartOfDay.Morning) {
      namedGreetingsPlain = m.Widgets_Greating_Messages_Morning_Named();
      namelessGreetingsPlain = m.Widgets_Greating_Messages_Morning();
    } else if (part === PartOfDay.Day) {
      namedGreetingsPlain = m.Widgets_Greating_Messages_Day_Named();
      namelessGreetingsPlain = m.Widgets_Greating_Messages_Day();
    } else if (part === PartOfDay.Evening) {
      namedGreetingsPlain = m.Widgets_Greating_Messages_Evening_Named();
      namelessGreetingsPlain = m.Widgets_Greating_Messages_Evening();
    } else if (part === PartOfDay.Night) {
      namedGreetingsPlain = m.Widgets_Greating_Messages_Night_Named();
      namelessGreetingsPlain = m.Widgets_Greating_Messages_Night();
    } else {
      namedGreetingsPlain = namelessGreetingsPlain = '';
    }

    const namedGreetings = namedGreetingsPlain.split(';');
    const namelessGreetings = namelessGreetingsPlain.split(';');

    const randomIndex = Math.floor(Math.random() * namedGreetings.length);
    return { named: namedGreetings[randomIndex], nameless: namelessGreetings[randomIndex] };
  }

  function getGreeting(template: { named: string; nameless: string }, name: string) {
    if (!template) return '';
    return name ? template.named.replace('[name]', name) : template.nameless;
  }
</script>

<div
  class="w-full h-full p-2 select-none flex justify-center content-center items-center flex-col"
  style:background-color={$backgroundColor}
  style:color={$textColor}
  style:font-weight={$fontWeight}
  style:backdrop-filter="blur({$backgroundBlur}px)"
  style:text-shadow="{$textShadowOffsetX}cqmin {$textShadowOffsetY}cqmin {$textShadowBlur}cqmin
  {$textShadowColor}"
  style:font-size="{$fontSize}cqmin"
  use:fontsource={{
    font: $fontId,
    subsets: $localeCharSubset,
    styles: ['normal'],
    weights: [$fontWeight],
  }}>
  <p class="text-[calc(85cqh-1rem)] text-center leading-tight">{getGreeting(greetingTemplate, $name)}</p>
</div>
