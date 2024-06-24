<script lang="ts">
  import { StaticImageSource, type Settings } from './settings';
  import * as m from '$i18n/messages';
  import SettingsBase from '$backgrounds/common-image/settings-base.svelte';
  import type { WorkspaceInstance } from '$lib/workspace-instance';
  import { FileButton, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
  import { OpfsSchema } from '$lib/opfs';
  import { nanoid } from 'nanoid/non-secure';
  import BrowserSupports, { Constraints } from '$shared-components/browser-supports.svelte';

  export let settings: Settings;
  export let workspace: WorkspaceInstance;

  const { url, source } = settings;

  let localFiles: FileList;

  async function onLocalFileChange() {
    if (localFiles.length <= 0) {
      return;
    }

    const file = localFiles[0];
    const fileExtensionSeparatorIndex = file.name.lastIndexOf('.');
    const fileExtension = fileExtensionSeparatorIndex >= 0 ? file.name.slice(fileExtensionSeparatorIndex) : '';
    const newUrl = await workspace.addInternalAsset(`static-bg-${nanoid()}${fileExtension}`, file);
    try {
      if ($url.startsWith(OpfsSchema)) {
        await workspace.removeInternalAsset($url);
      }
      $url = newUrl;
    } catch (error) {
      await workspace.removeInternalAsset(newUrl);
      throw error;
    }
  }

  async function onSourceTypeChange() {
    if ($url.startsWith(`${OpfsSchema}://`)) {
      await workspace.removeInternalAsset($url);
    }
    $url = '';
  }
</script>

<RadioGroup display="flex" active="variant-filled-primary" hover="hover:variant-soft-primary">
  <RadioItem bind:group={$source} name="source_url" value={StaticImageSource.Url} on:change={onSourceTypeChange}>
    {m.Backgrounds_StaticImage_Settings_Source_Type_Url()}
  </RadioItem>
  <RadioItem bind:group={$source} name="source_local" value={StaticImageSource.Local} on:change={onSourceTypeChange}>
    {m.Backgrounds_StaticImage_Settings_Source_Type_Local()}
  </RadioItem>
</RadioGroup>

{#if $source === StaticImageSource.Url}
  <label class="label">
    <span>{m.Backgrounds_StaticImage_Settings_Url()}</span>
    <input type="url" class="input" bind:value={$url} />
  </label>
{:else if $source === StaticImageSource.Local}
  <BrowserSupports constraint={Constraints.OPFS} class="!mt-4">
    <div class="mt-2 flex justify-center">
      <FileButton
        bind:files={localFiles}
        name="localFile"
        button="btn variant-soft"
        on:change={onLocalFileChange}
        accept="image/*">
        <div class="flex flex-row flex-nowrap gap-3 items-center">
          <span>{m.Backgrounds_StaticImage_Settings_Local_Select()}</span>
        </div>
      </FileButton>
    </div>
  </BrowserSupports>
{/if}

<SettingsBase {settings} />
