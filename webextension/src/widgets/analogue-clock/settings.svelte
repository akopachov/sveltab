<script lang="ts">
  import ColorPicker from '$shared-components/color-picker.svelte';
  import { RangeSlider, SlideToggle } from '@skeletonlabs/skeleton';
  import type { AnalogueClockSettings } from './settings';
  import { WatchfaceTabId, BackgroundTabId } from './settings-tabs';
  import * as m from '$i18n/messages';
  import ShadowSelector from '$shared-components/shadow-selector.svelte';
  import { Watchfaces } from './watchfaces';

  export let settings: AnalogueClockSettings;
  export let tab: number;

  const {
    backgroundColor,
    backgroundBlur,
    watchfaceColor,
    secondArmColor,
    displaySecondArm,
    minuteArmColor,
    hourArmColor,
    hourMarksColor,
    watchface,
    watchfaceBackgroundColor,
  } = settings;
</script>

{#if tab === WatchfaceTabId}
  <div>
    <label class="label mb-2">
      <span>{m.Widgets_AnalogueClock_Settings_Watchface()}</span>
      <select class="select" bind:value={$watchface}>
        {#each Watchfaces as [key, wf]}
          <option value={key}>{wf.name()}</option>
        {/each}
      </select>
    </label>
    <div class="label mb-2">
      <span>{m.Widgets_AnalogueClock_Settings_SecondsArm_Visible()}</span>
      <div>
        <SlideToggle name="secondsArmVisible" size="sm" bind:checked={$displaySecondArm} />
      </div>
    </div>
    <div class="label">
      <span>{m.Widgets_AnalogueClock_Settings_Watchface_Color()}</span>
      <div>
        <ColorPicker bind:color={$watchfaceColor} />
      </div>
    </div>
    <div class="label">
      <span>{m.Widgets_AnalogueClock_Settings_Watchface_BackgroundColor()}</span>
      <div>
        <ColorPicker bind:color={$watchfaceBackgroundColor} />
      </div>
    </div>
    <div class="label">
      <span>{m.Widgets_AnalogueClock_Settings_SecondsArm_Color()}</span>
      <div>
        <ColorPicker bind:color={$secondArmColor} />
      </div>
    </div>
    <div class="label">
      <span>{m.Widgets_AnalogueClock_Settings_MinutesArm_Color()}</span>
      <div>
        <ColorPicker bind:color={$minuteArmColor} />
      </div>
    </div>
    <div class="label">
      <span>{m.Widgets_AnalogueClock_Settings_HoursArm_Color()}</span>
      <div>
        <ColorPicker bind:color={$hourArmColor} />
      </div>
    </div>
    <div class="label">
      <span>{m.Widgets_AnalogueClock_Settings_HourMarks_Color()}</span>
      <div>
        <ColorPicker bind:color={$hourMarksColor} />
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
  <div class="label">
    <span>{m.Widgets_AnalogueClock_Settings_Background_Color()}</span>
    <div>
      <ColorPicker bind:color={$backgroundColor} />
    </div>
  </div>
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label class="label mb-2">
    <span>{m.Widgets_AnalogueClock_Settings_Blur()}</span>
    <RangeSlider name="blurSlider" bind:value={$backgroundBlur} min={0} max={15} step={0.1}></RangeSlider>
  </label>
{/if}
