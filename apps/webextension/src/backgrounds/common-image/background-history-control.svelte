<script lang="ts">
  import { forceNextBackground, forcePreviousBackground, ActiveBackgroundProvider } from '$actions/dynamic-background';
  import * as m from '$i18n/messages';

  let { class: className = '' } = $props();
</script>

<div class="flex flex-row gap-2 justify-center {className}">
  {#if $ActiveBackgroundProvider?.canGoBack === true}
    <button class="btn variant-soft" onclick={forcePreviousBackground}>
      {m.Backgrounds_ImageCommon_Settings_Previous()}
    </button>
  {/if}
  {#if $ActiveBackgroundProvider?.canGoNext === true}
    <button class="btn variant-soft" onclick={forceNextBackground}>
      {m.Backgrounds_ImageCommon_Settings_Next()}
    </button>
  {/if}
</div>
