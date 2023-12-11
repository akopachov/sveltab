<script lang="ts">
  import { forceUpdateBackground } from '$actions/dynamic-background';
  import type { Settings } from './settings';
  import * as m from '$i18n/messages';

  export let settings: Settings;
</script>

<label class="label">
  <span>{m.Backgrounds_RandomColor_Settings_Luminosity()}</span>
  <select class="select" bind:value={$settings.luminosity}>
    <option value="random">{m.Backgrounds_RandomColor_Settings_Luminosity_Any()}</option>
    <option value="bright">{m.Backgrounds_RandomColor_Settings_Luminosity_Bright()}</option>
    <option value="light">{m.Backgrounds_RandomColor_Settings_Luminosity_Light()}</option>
    <option value="dark">{m.Backgrounds_RandomColor_Settings_Luminosity_Dark()}</option>
  </select>
</label>

<label class="label">
  <span>{m.Backgrounds_RandomColor_Settings_Hue()}</span>
  <select class="select" bind:value={$settings.hue}>
    <option value="random">{m.Backgrounds_RandomColor_Settings_Hue_Any()}</option>
    <option value="red">{m.Backgrounds_RandomColor_Settings_Hue_Red()}</option>
    <option value="orange">{m.Backgrounds_RandomColor_Settings_Hue_Orange()}</option>
    <option value="yellow">{m.Backgrounds_RandomColor_Settings_Hue_Yellow()}</option>
    <option value="green">{m.Backgrounds_RandomColor_Settings_Hue_Green()}</option>
    <option value="blue">{m.Backgrounds_RandomColor_Settings_Hue_Blue()}</option>
    <option value="purple">{m.Backgrounds_RandomColor_Settings_Hue_Purple()}</option>
    <option value="pink">{m.Backgrounds_RandomColor_Settings_Hue_Pink()}</option>
  </select>
</label>

<button class="btn variant-soft" on:click={forceUpdateBackground}>
  {m.Backgrounds_RandomColor_Settings_Refresh()}
</button>
