<script lang="ts">
  import * as m from '$i18n/messages';
  import { ProgressRadial } from '@skeletonlabs/skeleton';
  import { getAvailableTranslations } from './api';
  import { onMount } from 'svelte';

  let { translationId = $bindable() }: { translationId: string } = $props();
  let selectedLanguageId = $state('');

  const translations = getAvailableTranslations();
  const translationsByLanguage = translations.then(r => Object.groupBy(r, k => k.language));
  const languages = translationsByLanguage.then(r =>
    Object.entries(r)
      .map(([key, value]) => ({ id: key, displayName: value![0].languageEnglishName ?? '' }))
      .toSorted((a, b) => a.displayName.localeCompare(b.displayName)),
  );

  onMount(() => {
    translations.then(r => {
      const translation = r.find(t => t.id === translationId);
      if (translation) {
        selectedLanguageId = translation.language;
      }
    });
  });
</script>

{#await languages}
  <ProgressRadial width="w-12 mx-auto my-4" />
{:then languages}
  <label class="label mb-2">
    <span>{m.Widgets_BibleVerse_Settings_Translation_Language()}</span>
    <select class="select" bind:value={selectedLanguageId}>
      {#each languages as language}
        <option value={language.id}>{language.displayName}</option>
      {/each}
    </select>
  </label>
{/await}

{#await translationsByLanguage then translationsByLanguage}
  <label class="label mb-2">
    <span>{m.Widgets_BibleVerse_Settings_Translation()}</span>
    <select class="select" bind:value={translationId}>
      {#each translationsByLanguage[selectedLanguageId]! as translation}
        <option value={translation.id}>{translation.name}</option>
      {/each}
    </select>
  </label>
{/await}
