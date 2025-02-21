<script lang="ts">
  import { locales } from '$i18n/runtime';
  import { firstLetterToUpperCase } from '$lib/string-utils';
  import { locale } from '$stores/locale';

  let langDisplayNames = $derived(new Intl.DisplayNames([$locale], { type: 'language' }));
</script>

<select class="select" bind:value={$locale}>
  {#each locales as lang}
    <option value={lang}>{firstLetterToUpperCase(langDisplayNames.of(lang))}</option>
  {/each}
</select>
