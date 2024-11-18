<script lang="ts">
  import { type Settings, type WallhavenPurity, WallhavenSearchColors } from './settings';
  import NumberInput from '$shared-components/number-input.svelte';
  import * as m from '$i18n/messages';
  import SettingsBase from '$backgrounds/common-image/settings-base.svelte';
  import BackgroundHistoryControl from '$backgrounds/common-image/background-history-control.svelte';

  let { settings }: { settings: Settings } = $props();

  let updateInterval = $state(settings.updateInterval.value / 60);

  enum ContentPurity {
    SFW = 0,
    Sketchy = 1,
    NSFW = 2,
  }

  $effect(() => {
    settings.updateInterval.value = Math.max(updateInterval, 1) * 60;
  });

  function updatePurity(target: HTMLInputElement, value: ContentPurity) {
    const purities = settings.purity.value.split('');
    purities[value] = target.checked ? '1' : '0';
    settings.purity.value = <WallhavenPurity>purities.join('');
  }
</script>

<label class="label">
  <span>{m.Backgrounds_Wallhaven_Settings_SearchTerms()}</span>
  <input
    type="search"
    class="input"
    bind:value={settings.searchTerms.value}
    placeholder={m.Backgrounds_Wallhaven_Settings_SearchTerms_Placeholder()} />
</label>
<label class="label">
  <span>{m.Backgrounds_Wallhaven_Settings_ApiKey()}</span>
  <input type="password" class="input" autocomplete="off" bind:value={settings.apiKey.value} />
</label>
<div class="label">
  <span>{m.Backgrounds_Wallhaven_Settings_Purity()}</span>
  <div class="space-y-2">
    <label class="flex items-center space-x-2">
      <input
        class="checkbox"
        type="checkbox"
        checked={settings.purity.value[0] === '1'}
        onchange={e => updatePurity(e.currentTarget, ContentPurity.SFW)} />
      <span>{m.Backgrounds_Wallhaven_Settings_Purity_SFW()}</span>
    </label>
    <label class="flex items-center space-x-2">
      <input
        class="checkbox"
        type="checkbox"
        checked={settings.purity.value[1] === '1'}
        onchange={e => updatePurity(e.currentTarget, ContentPurity.Sketchy)} />
      <span>{m.Backgrounds_Wallhaven_Settings_Purity_Sketchy()}</span>
    </label>
    {#if settings.apiKey.value}
      <label class="flex items-center space-x-2">
        <input
          class="checkbox"
          type="checkbox"
          checked={settings.purity.value[2] === '1'}
          onchange={e => updatePurity(e.currentTarget, ContentPurity.NSFW)} />
        <span>{m.Backgrounds_Wallhaven_Settings_Purity_NSFW()}</span>
      </label>
    {/if}
  </div>
</div>
<div class="label">
  <span>{m.Backgrounds_Wallhaven_Settings_Colors()}</span>
  <div class="grid gap-2 grid-cols-[repeat(auto-fill,minmax(1.5rem,1fr))]">
    {#each WallhavenSearchColors as color}
      <label
        style:--sv-outline-color="#{color}"
        class="[&>input:checked_~_span]:outline-[var(--sv-outline-color)] [&>input:checked~span]:outline-4 [&>input:checked~span]:outline aspect-square">
        <input type="checkbox" class="hidden" value={color} bind:group={settings.colors.value} />
        <span style:background-color="#{color}" class="block w-full h-full cursor-pointer"></span>
      </label>
    {/each}
  </div>
</div>
<!-- svelte-ignore a11y_label_has_associated_control -->
<label class="label">
  <span>{m.Backgrounds_Wallhaven_Settings_UpdateInterval()}</span>
  <div>
    <NumberInput bind:value={updateInterval} min={1} />
  </div>
</label>

<SettingsBase {settings} provider={{ href: 'https://wallhaven.cc', name: 'Wallhaven' }} />

<BackgroundHistoryControl />
