<script lang="ts">
  import { availableLanguageTags } from '$i18n/runtime';
  import { locale } from '$stores/locale';

  $: langDisplayNames = new Intl.DisplayNames([$locale], { type: 'language' });
</script>

<select class="select" bind:value={$locale}>
  {#each availableLanguageTags as lang}
    <option value={lang}>{langDisplayNames.of(lang)}</option>
  {/each}
</select>
