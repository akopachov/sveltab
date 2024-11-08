<script lang="ts">
  import { availableLanguageTags } from '$i18n/runtime';
  import { locale } from '$stores/locale';

  let langDisplayNames = $derived(new Intl.DisplayNames([$locale], { type: 'language' }));

  function pascalCase(s: string | undefined) {
    if (!s) return s;
    return `${s[0].toUpperCase()}${s.slice(1)}`;
  }
</script>

<select class="select" bind:value={$locale}>
  {#each availableLanguageTags as lang}
    <option value={lang}>{pascalCase(langDisplayNames.of(lang))}</option>
  {/each}
</select>
