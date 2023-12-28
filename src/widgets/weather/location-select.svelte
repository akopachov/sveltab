<script lang="ts">
  import type { GeoLocation, GeoLocationInitial } from './settings';
  import * as m from '$i18n/messages';
  import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
  import { debounce, type DebounceOptions } from 'svelte-use-debounce';
  import { locale } from '$stores/locale';

  export let location: GeoLocation;

  const locationPopupSettings: PopupSettings = {
    event: 'focus-click',
    target: 'Widget_Weather_Settings_Location',
    placement: 'bottom',
  };

  const locationSearchDebounceOpts: DebounceOptions = {
    ms: 500,
    callback: async str => {
      if (str?.length > 2) {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            str,
          )}&count=15&language=${$locale}&format=json`,
        ).then(r => r.json());
        if (response.results) {
          locationSearchSuggestion = response.results.map((r: any) => ({
            city: r.name,
            latitude: r.latitude,
            longitude: r.longitude,
            country: r.country,
            admin1: r.admin1,
            admin2: r.admin2,
          }));
        } else {
          locationSearchSuggestion = [];
        }
      } else {
        locationSearchSuggestion = [];
      }
    },
  };
  let locationSearchSuggestion: Required<GeoLocationInitial>[] = [];

  function selectLocation(newLocation: Required<GeoLocationInitial>) {
    $location.city = newLocation.city;
    $location.latitude = newLocation.latitude;
    $location.longitude = newLocation.longitude;
    $location.country = newLocation.country;
    $location.admin1 = newLocation.admin1;
    $location.admin2 = newLocation.admin2;
    locationSearchSuggestion = [];
  }
</script>

<label class="label">
  <span>{m.Widgets_Weather_Settings_Location_Label()}</span>
  <input
    class="input"
    type="search"
    value={$location.city ? `${$location.city}, ${$location.country}` : ''}
    placeholder={m.Widgets_Weather_Settings_Location_Placeholder()}
    use:popup={locationPopupSettings}
    use:debounce={locationSearchDebounceOpts} />
</label>
<div
  class="card w-fit max-w-[100cqw] max-h-[calc(100cqh-16px)] h-fit overflow-y-auto flex z-[9999] p-2"
  data-popup={locationPopupSettings.target}
  style:visibility={locationSearchSuggestion.length > 0 ? 'visible' : 'hidden'}>
  <ul class="list">
    {#each locationSearchSuggestion as suggestion}
      <li>
        <button class="btn variant-soft w-full mb-1 rounded-sm" on:click={() => selectLocation(suggestion)}>
          <span class="flex-auto">{suggestion.city}, {suggestion.admin1}, {suggestion.country}</span>
        </button>
      </li>
    {/each}
  </ul>
</div>
