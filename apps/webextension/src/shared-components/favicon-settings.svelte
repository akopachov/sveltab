<script lang="ts">
  import { opfsSrc } from '$actions/opfs-src';
  import type { WorkspaceInstance } from '$lib/workspace-instance';
  import { FileButton, ProgressRadial, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
  import { nanoid } from 'nanoid/non-secure';
  import { onMount } from 'svelte';
  import * as m from '$i18n/messages';
  import { logger } from '$lib/logger';
  import BrowserSupports, { Constraints } from './browser-supports.svelte';
  import { WeakLazy } from '$lib/lazy';

  enum FaviconType {
    Default = 'default',
    Manual = 'manual',
  }

  const log = logger.getSubLogger({ prefix: ['Favicon settings:'] });

  let { workspaceInstance }: { workspaceInstance: WorkspaceInstance } = $props();

  let faviconType: FaviconType = $state(FaviconType.Default);
  let iconFileSources: FileList | undefined = $state();
  let isLoading = $state(false);

  let icon16 = $derived(workspaceInstance.favicon[16]);
  let icon32 = $derived(workspaceInstance.favicon[32]);
  let icon48 = $derived(workspaceInstance.favicon[48]);
  let iconIco = $derived(workspaceInstance.favicon.ico);

  const generateFaviconContainer = new WeakLazy(() => import('favicon-gen').then(mod => mod.generateFavicon));

  async function saveFavicon(iconData: Blob, extension: string) {
    if (!iconData) {
      return '';
    }
    const filePath = `favicon-${nanoid()}.${extension}`;
    return await workspaceInstance?.internalAssetsManager.addAsset(filePath, iconData);
  }

  async function tryRemoveFavicon(fileName: string | undefined) {
    if (!fileName) {
      return;
    }

    try {
      await workspaceInstance?.internalAssetsManager.removeAsset(fileName);
    } catch (error) {
      log.error(error);
    }
  }

  async function onFaviconTypeChange() {
    if (faviconType === FaviconType.Default) {
      await Promise.all([
        tryRemoveFavicon(icon16.value),
        tryRemoveFavicon(icon32.value),
        tryRemoveFavicon(icon48.value),
        tryRemoveFavicon(iconIco.value),
      ]);
      icon16.value = '';
      icon32.value = '';
      icon48.value = '';
      iconIco.value = '';
    }
  }

  async function onCustomIconFileChange() {
    if (!iconFileSources || iconFileSources.length <= 0) {
      return;
    }

    isLoading = true;
    try {
      const generateFavicon = await generateFaviconContainer.value;
      const faviconInfo = await generateFavicon(iconFileSources[0]);

      await Promise.all([
        tryRemoveFavicon(icon16.value),
        tryRemoveFavicon(icon32.value),
        tryRemoveFavicon(icon48.value),
        tryRemoveFavicon(iconIco.value),
      ]);

      [icon16.value, icon32.value, icon48.value, iconIco.value] = await Promise.all([
        saveFavicon(faviconInfo[16], 'png'),
        saveFavicon(faviconInfo[32], 'png'),
        saveFavicon(faviconInfo[48], 'png'),
        saveFavicon(faviconInfo.ico, 'ico'),
      ]);
    } catch (error) {
      log.error(error);
      icon16.value = '';
      icon32.value = '';
      icon48.value = '';
      iconIco.value = '';
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    faviconType = icon16.value || icon32.value ? FaviconType.Manual : FaviconType.Default;
  });
</script>

<RadioGroup display="flex" active="variant-filled-primary" hover="hover:variant-soft-primary">
  <RadioItem
    bind:group={faviconType}
    name="favicon_default"
    value={FaviconType.Default}
    on:change={onFaviconTypeChange}>
    {m.Favicon_Settings_Type_Default()}
  </RadioItem>
  <RadioItem bind:group={faviconType} name="favicon_manual" value={FaviconType.Manual}>
    {m.Favicon_Settings_Type_Manual()}
  </RadioItem>
</RadioGroup>
{#if faviconType === FaviconType.Manual}
  <BrowserSupports constraint={Constraints.OPFS} class="mt-4">
    <div class="mt-2 flex justify-center">
      <FileButton
        bind:files={iconFileSources}
        name="iconFile"
        button="btn variant-soft"
        on:change={onCustomIconFileChange}>
        <div id="faviconPreviewContainer" class="flex flex-row flex-nowrap gap-3 items-center">
          {#if isLoading}
            <ProgressRadial width="w-[32px]" />
          {:else}
            {#if icon32.value}
              <img
                class="w-[32px] h-[32px] rounded-sm text-[0]"
                use:opfsSrc={icon32.value}
                width="32"
                height="32"
                alt="32x32" />
            {/if}
            {#if icon16.value}
              <img
                class="w-[16px] h-[16px] rounded-sm text-[0]"
                use:opfsSrc={icon16.value}
                width="16"
                height="16"
                alt="16x16" />
            {/if}
          {/if}
          <span>{m.Favicon_Settings_UploadIcon()}</span>
        </div>
      </FileButton>
    </div>
  </BrowserSupports>
{/if}
