<script module lang="ts">
  import * as m from '$i18n/messages';

  const WatchfaceTabId = 1;
  const BackgroundTabId = 2;
  const Tabs = [
    {
      id: WatchfaceTabId,
      title: () => m.Widgets_AnalogueClock_Settings_Tabs_Watchface(),
    },
    {
      id: BackgroundTabId,
      title: () => m.Widgets_AnalogueClock_Settings_Tabs_Background(),
    },
  ];
</script>

<script lang="ts">
  import ColorPicker from '$shared-components/color-picker.svelte';
  import { SlideToggle } from '@skeletonlabs/skeleton';
  import type { AnalogueClockSettings } from './settings';
  import ShadowSelector from '$shared-components/shadow-selector.svelte';
  import { Watchfaces } from './watchfaces';
  import BackgroundSettings from '$shared-components/background-settings.svelte';
  import { onMount } from 'svelte';

  let {
    settings,
    tab,
    tabs = $bindable(),
  }: { settings: AnalogueClockSettings; tab: number; tabs: object[] } = $props();

  onMount(() => {
    tabs = Tabs;
  });
</script>

{#if tab === WatchfaceTabId}
  <div>
    <label class="label mb-2">
      <span>{m.Widgets_AnalogueClock_Settings_Watchface()}</span>
      <select class="select" bind:value={settings.watchface.value}>
        {#each Watchfaces as [key, wf]}
          <option value={key}>{wf.name()}</option>
        {/each}
      </select>
    </label>
    <div class="label mb-2">
      <span>{m.Widgets_AnalogueClock_Settings_SecondsArm_Visible()}</span>
      <div>
        <SlideToggle name="secondsArmVisible" size="sm" bind:checked={settings.displaySecondArm.value} />
      </div>
    </div>
    <div class="label">
      <span>{m.Widgets_AnalogueClock_Settings_Watchface_Color()}</span>
      <div>
        <ColorPicker bind:color={settings.watchfaceColor.value} />
      </div>
    </div>
    <div class="label">
      <span>{m.Widgets_AnalogueClock_Settings_Watchface_BackgroundColor()}</span>
      <div>
        <ColorPicker bind:color={settings.watchfaceBackgroundColor.value} />
      </div>
    </div>
    <div class="label">
      <span>{m.Widgets_AnalogueClock_Settings_SecondsArm_Color()}</span>
      <div>
        <ColorPicker bind:color={settings.secondArmColor.value} />
      </div>
    </div>
    <div class="label">
      <span>{m.Widgets_AnalogueClock_Settings_MinutesArm_Color()}</span>
      <div>
        <ColorPicker bind:color={settings.minuteArmColor.value} />
      </div>
    </div>
    <div class="label">
      <span>{m.Widgets_AnalogueClock_Settings_HoursArm_Color()}</span>
      <div>
        <ColorPicker bind:color={settings.hourArmColor.value} />
      </div>
    </div>
    <div class="label">
      <span>{m.Widgets_AnalogueClock_Settings_HourMarks_Color()}</span>
      <div>
        <ColorPicker bind:color={settings.hourMarksColor.value} />
      </div>
    </div>
    <div class="mt-2">
      <h4>{m.Widgets_AnalogueClock_Settings_Shadow()}</h4>
      <div class="pl-4 pr-4">
        <ShadowSelector shadowSettings={settings.shadow} />
      </div>
    </div>
  </div>
{:else if tab === BackgroundTabId}
  <BackgroundSettings bind:color={settings.backgroundColor.value} bind:blur={settings.backgroundBlur.value} />
{/if}
