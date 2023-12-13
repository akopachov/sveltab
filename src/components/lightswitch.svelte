<script lang="ts">
  import { PreferedColorScheme } from '$stores/color-scheme-store';
  import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
  import * as m from '$i18n/messages';
</script>

<RadioGroup active="variant-filled-primary" hover="hover:variant-soft-primary">
  <RadioItem bind:group={$PreferedColorScheme} name="justify" value="light">
    {m.Lightswitch_ColorScheme_Light()}
  </RadioItem>
  <RadioItem bind:group={$PreferedColorScheme} name="justify" value="auto">
    {m.Lightswitch_ColorScheme_Auto()}
  </RadioItem>
  <RadioItem bind:group={$PreferedColorScheme} name="justify" value="dark">
    {m.Lightswitch_ColorScheme_Dark()}
  </RadioItem>
</RadioGroup>
