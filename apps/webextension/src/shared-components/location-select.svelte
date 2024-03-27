<script context="module" lang="ts">
  export type GeoLocationInitial = Partial<Unobserved<GeoLocation>>;
  export class GeoLocation {
    constructor(initial: GeoLocationInitial) {
      this.city = useObservable(initial.city || '');
      this.latitude = useObservable(initial.latitude || 0);
      this.longitude = useObservable(initial.longitude || 0);
      this.country = useObservable(initial.country || '');
      this.admin1 = useObservable(initial.admin1 || '');
      this.admin2 = useObservable(initial.admin2 || '');
    }

    readonly city: Observable<string>;
    readonly latitude: Observable<number>;
    readonly longitude: Observable<number>;
    readonly country: Observable<string>;
    readonly admin1: Observable<string>;
    readonly admin2: Observable<string>;
  }
</script>

<script lang="ts">
  import * as m from '$i18n/messages';
  import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
  import { debounce, type DebounceOptions } from 'svelte-use-debounce';
  import { locale } from '$stores/locale';
  import { useObservable, type Observable, type Unobserved } from '$lib/observable';

  export let location: GeoLocation;

  const { city, admin1, admin2, country, latitude, longitude } = location;

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
            admin1: r.admin1 || '',
            admin2: r.admin2 || '',
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
    $city = newLocation.city;
    $latitude = newLocation.latitude;
    $longitude = newLocation.longitude;
    $country = newLocation.country;
    $admin1 = newLocation.admin1;
    $admin2 = newLocation.admin2;
    locationSearchSuggestion = [];
  }
</script>

<label class="label">
  <span>{m.LocationSelector_Label()}</span>
  <input
    class="input"
    type="search"
    value={$city ? `${$city}, ${$country}` : ''}
    placeholder={m.LocationSelector_Placeholder()}
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
          <span class="flex-auto">
            {suggestion.city}, {suggestion.admin1 ? `${suggestion.admin1}, ` : ''}{suggestion.country}
          </span>
        </button>
      </li>
    {/each}
  </ul>
</div>
