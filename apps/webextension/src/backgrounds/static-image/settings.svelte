<script lang="ts">
  import { StaticImageSource, type Settings } from './settings';
  import * as m from '$i18n/messages';
  import SettingsBase from '$backgrounds/common-image/settings-base.svelte';
  import type { WorkspaceInstance } from '$lib/workspace-instance';
  import { FileButton, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
  import { OpfsSchema } from '$lib/opfs';
  import { nanoid } from 'nanoid/non-secure';
  import BrowserSupports, { Constraints } from '$shared-components/browser-supports.svelte';
  import BackgroundHistoryControl from '$backgrounds/common-image/background-history-control.svelte';
  import { getFileExtension } from '$lib/path-utils';

  let { settings, workspace }: { settings: Settings; workspace: WorkspaceInstance } = $props();

  let localFiles: FileList | undefined = $state();

  async function onLocalFileChange() {
    if (!localFiles || localFiles.length <= 0) {
      return;
    }

    const file = localFiles[0];
    const fileExtension = getFileExtension(file.name);
    const newUrl = await workspace.internalAssetsManager.addAsset(`static-bg-${nanoid()}${fileExtension}`, file);
    try {
      if (settings.url.value.startsWith(OpfsSchema)) {
        await workspace.internalAssetsManager.removeAsset(settings.url.value);
      }
      settings.url.value = newUrl;
    } catch (error) {
      await workspace.internalAssetsManager.removeAsset(newUrl);
      throw error;
    }
  }

  async function onSourceTypeChange() {
    if (settings.url.value.startsWith(`${OpfsSchema}://`)) {
      await workspace.internalAssetsManager.removeAsset(settings.url.value);
    }
    settings.url.value = '';
  }
</script>

<RadioGroup display="flex" active="variant-filled-primary" hover="hover:variant-soft-primary">
  <RadioItem
    bind:group={settings.source.value}
    name="source_url"
    value={StaticImageSource.Url}
    on:change={onSourceTypeChange}>
    {m.Backgrounds_StaticImage_Settings_Source_Type_Url()}
  </RadioItem>
  <RadioItem
    bind:group={settings.source.value}
    name="source_local"
    value={StaticImageSource.Local}
    on:change={onSourceTypeChange}>
    {m.Backgrounds_StaticImage_Settings_Source_Type_Local()}
  </RadioItem>
</RadioGroup>

{#if settings.source.value === StaticImageSource.Url}
  <label class="label">
    <span>{m.Backgrounds_StaticImage_Settings_Url()}</span>
    <input id="cbxStaticImageBgProvider_Settings_Url" type="url" class="input" bind:value={settings.url.value} />
  </label>
{:else if settings.source.value === StaticImageSource.Local}
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

<BackgroundHistoryControl />
