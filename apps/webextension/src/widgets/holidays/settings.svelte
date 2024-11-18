<script module lang="ts">
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
  import { onMount } from 'svelte';

  let { settings, tab, tabs = $bindable() }: { settings: Settings; tab: number; tabs: object[] } = $props();

  let countryDisplayNames = $derived(new Intl.DisplayNames([$locale], { type: 'region' }));
  let availableCountries = $state([settings.country.value]);

  async function loadAvailableCountries() {
    if (availableCountries.length > 1) {
      return;
    }

    availableCountries = await getAvailableCountryCodes();
  }

  onMount(() => {
    tabs = Tabs;
  });
</script>

{#if tab === GeneralTabId}
  <label class="label mb-2">
    <span>{m.Widgets_Holidays_Settings_Country()}</span>
    <select class="select" bind:value={settings.country.value} onfocus={loadAvailableCountries}>
      {#each availableCountries as code (code)}
        <option value={code} selected={code === settings.country.value}>{countryDisplayNames.of(code)}</option>
      {/each}
    </select>
  </label>
  <!-- svelte-ignore a11y_label_has_associated_control -->
  <label class="label mb-2">
    <span>{m.Widgets_Holidays_Settings_PastCount()}</span>
    <div>
      <NumberInput bind:value={settings.pastCount.value} min={0} />
    </div>
  </label>
  <!-- svelte-ignore a11y_label_has_associated_control -->
  <label class="label mb-2">
    <span>{m.Widgets_Holidays_Settings_UpcommingCount()}</span>
    <div>
      <NumberInput bind:value={settings.upcommingCount.value} min={0} />
    </div>
  </label>
{:else if tab === TypesTabId}
  <label class="flex items-center space-x-2 w-full mb-2">
    <input class="checkbox" type="checkbox" value={HolidayType.Public} bind:group={settings.typesOfInterest.value} />
    <p>{m.Widgets_Holidays_Settings_Types_Public()}</p>
  </label>
  <label class="flex items-center space-x-2 w-full mb-2">
    <input class="checkbox" type="checkbox" value={HolidayType.Bank} bind:group={settings.typesOfInterest.value} />
    <p>{m.Widgets_Holidays_Settings_Types_Bank()}</p>
  </label>
  <label class="flex items-center space-x-2 w-full mb-2">
    <input class="checkbox" type="checkbox" value={HolidayType.School} bind:group={settings.typesOfInterest.value} />
    <p>{m.Widgets_Holidays_Settings_Types_School()}</p>
  </label>
  <label class="flex items-center space-x-2 w-full mb-2">
    <input
      class="checkbox"
      type="checkbox"
      value={HolidayType.Authorities}
      bind:group={settings.typesOfInterest.value} />
    <p>{m.Widgets_Holidays_Settings_Types_Authorities()}</p>
  </label>
  <label class="flex items-center space-x-2 w-full mb-2">
    <input class="checkbox" type="checkbox" value={HolidayType.Optional} bind:group={settings.typesOfInterest.value} />
    <p>{m.Widgets_Holidays_Settings_Types_Optional()}</p>
  </label>
  <label class="flex items-center space-x-2 w-full mb-2">
    <input
      class="checkbox"
      type="checkbox"
      value={HolidayType.Observance}
      bind:group={settings.typesOfInterest.value} />
    <p>{m.Widgets_Holidays_Settings_Types_Observance()}</p>
  </label>
{:else if tab === TextTabId}
  <div>
    <div class="label mb-2">
      <span>{m.Widgets_Holidays_Settings_FontToday()}</span>
      <FontSelector font={settings.fontToday} bind:color={settings.textColorToday.value} />
    </div>
    <TextSettings
      font={settings.font}
      bind:color={settings.textColor.value}
      shadow={settings.textShadow}
      stroke={settings.textStroke} />
  </div>
{:else if tab === BackgroundTabId}
  <BackgroundSettings bind:color={settings.backgroundColor.value} bind:blur={settings.backgroundBlur.value} />
{/if}
