<script context="module" lang="ts">
  import * as m from '$i18n/messages';

  const TypesTabId = 1;
  const TextTabId = 2;
  const BackgroundTabId = 3;
  const Tabs = [
    {
      id: TypesTabId,
      title: () => m.Widgets_Holidays_Settings_Tabs_Types(),
    },
    {
      id: TextTabId,
      title: () => m.Widgets_Holidays_Settings_Tabs_Text(),
    },
    {
      id: BackgroundTabId,
      title: () => m.Widgets_Holidays_Settings_Tabs_Background(),
    },
  ];
</script>

<script lang="ts">
  import type { Settings } from './settings';
  import FontSelector from '$shared-components/font-selector.svelte';
  import { GeneralTabId } from '$shared-components/widget-settings.svelte';
  import NumberInput from '$shared-components/number-input.svelte';
  import { locale } from '$stores/locale';
  import { getAvailableCountryCodes, HolidayType } from './api';
  import TextSettings from '$shared-components/text-settings.svelte';
  import BackgroundSettings from '$shared-components/background-settings.svelte';

  export let settings: Settings;
  export let tab: number;
  export const tabs = Tabs;

  const {
    font,
    fontToday,
    textColor,
    textColorToday,
    backgroundColor,
    backgroundBlur,
    country,
    upcommingCount,
    pastCount,
    typesOfInterest,
  } = settings;
  $: countryDisplayNames = new Intl.DisplayNames([$locale], { type: 'region' });
  let availableCountries = [$country];

  async function loadAvailableCountries() {
    if (availableCountries.length > 1) {
      return;
    }

    availableCountries = await getAvailableCountryCodes();
  }
</script>

{#if tab === GeneralTabId}
  <label class="label mb-2">
    <span>{m.Widgets_Holidays_Settings_Country()}</span>
    <select class="select" bind:value={$country} on:focus={loadAvailableCountries}>
      {#each availableCountries as code (code)}
        <option value={code} selected={code === $country}>{countryDisplayNames.of(code)}</option>
      {/each}
    </select>
  </label>
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label mb-2">
    <span>{m.Widgets_Holidays_Settings_PastCount()}</span>
    <div>
      <NumberInput bind:value={$pastCount} min={0} />
    </div>
  </label>
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label mb-2">
    <span>{m.Widgets_Holidays_Settings_UpcommingCount()}</span>
    <div>
      <NumberInput bind:value={$upcommingCount} min={0} />
    </div>
  </label>
{:else if tab === TypesTabId}
  <label class="flex items-center space-x-2 w-full mb-2">
    <input class="checkbox" type="checkbox" value={HolidayType.Public} bind:group={$typesOfInterest} />
    <p>{m.Widgets_Holidays_Settings_Types_Public()}</p>
  </label>
  <label class="flex items-center space-x-2 w-full mb-2">
    <input class="checkbox" type="checkbox" value={HolidayType.Bank} bind:group={$typesOfInterest} />
    <p>{m.Widgets_Holidays_Settings_Types_Bank()}</p>
  </label>
  <label class="flex items-center space-x-2 w-full mb-2">
    <input class="checkbox" type="checkbox" value={HolidayType.School} bind:group={$typesOfInterest} />
    <p>{m.Widgets_Holidays_Settings_Types_School()}</p>
  </label>
  <label class="flex items-center space-x-2 w-full mb-2">
    <input class="checkbox" type="checkbox" value={HolidayType.Authorities} bind:group={$typesOfInterest} />
    <p>{m.Widgets_Holidays_Settings_Types_Authorities()}</p>
  </label>
  <label class="flex items-center space-x-2 w-full mb-2">
    <input class="checkbox" type="checkbox" value={HolidayType.Optional} bind:group={$typesOfInterest} />
    <p>{m.Widgets_Holidays_Settings_Types_Optional()}</p>
  </label>
  <label class="flex items-center space-x-2 w-full mb-2">
    <input class="checkbox" type="checkbox" value={HolidayType.Observance} bind:group={$typesOfInterest} />
    <p>{m.Widgets_Holidays_Settings_Types_Observance()}</p>
  </label>
{:else if tab === TextTabId}
  <div>
    <div class="label mb-2">
      <span>{m.Widgets_Holidays_Settings_FontToday()}</span>
      <FontSelector font={fontToday} bind:color={$textColorToday} />
    </div>
    <TextSettings {font} bind:color={$textColor} shadow={settings.textShadow} stroke={settings.textStroke} />
  </div>
{:else if tab === BackgroundTabId}
  <BackgroundSettings bind:color={$backgroundColor} bind:blur={$backgroundBlur} />
{/if}
