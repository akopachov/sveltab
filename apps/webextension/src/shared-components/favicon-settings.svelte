<script lang="ts">
  import { opfsSrc } from '$actions/opfs-src';
  import { PUBLIC_REALFAVICON_API_KEY } from '$env/static/public';
  import { getCorsFriendlyUrl } from '$lib/cors-bypass.gen';
  import type { WorkspaceInstance } from '$lib/workspace-instance';
  import { FileButton, ProgressRadial, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
  import { nanoid } from 'nanoid/non-secure';
  import { onMount } from 'svelte';
  import * as m from '$i18n/messages';
  import type { RealFaviconGenerator } from '$lib/realfavicongenerator';
  import { logger } from '$lib/logger';

  const log = logger.getSubLogger({ prefix: ['Favicon settings:'] });

  export let workspaceInstance: WorkspaceInstance | undefined;

  let faviconType: FaviconType;
  let iconFileSources: FileList;
  let isLoading = false;

  $: icon16 = workspaceInstance?.favicon[16];
  $: icon32 = workspaceInstance?.favicon[32];
  $: iconIco = workspaceInstance?.favicon.ico;

  enum FaviconType {
    Default = 'default',
    Manual = 'manual',
  }

  async function saveFavicon(url: string) {
    if (!url) {
      return '';
    }
    const response = await fetch(url);
    const blob = await response.blob();
    const fileExtension = url.split('.').pop();
    const filePath = `favicon-${nanoid()}.${fileExtension}`;
    return await workspaceInstance?.addInternalAsset(filePath, blob);
  }

  async function tryRemoveFavicon(fileName: string | undefined) {
    if (!fileName) {
      return;
    }

    try {
      await workspaceInstance?.removeInternalAsset(fileName);
    } catch (error) {
      log.error(error);
    }
  }

  function fileToBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).replace(/^data:(.*,)?/, ''));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function onFaviconTypeChange() {
    if (faviconType === FaviconType.Default) {
      await Promise.all([tryRemoveFavicon($icon16), tryRemoveFavicon($icon32), tryRemoveFavicon($iconIco)]);
      $icon16 = '';
      $icon32 = '';
      $iconIco = '';
    }
  }

  async function onCustomIconFileChange() {
    if (iconFileSources.length <= 0) {
      return;
    }

    isLoading = true;
    try {
      const requestBody: RealFaviconGenerator.GenerationRequest = {
        favicon_generation: {
          api_key: PUBLIC_REALFAVICON_API_KEY,
          master_picture: {
            type: 'inline',
            content: await fileToBase64(iconFileSources[0]),
          },
          files_location: {
            type: 'root',
          },
          favicon_design: {
            desktop_browser: {},
          },
          settings: {
            compression: '3',
            scaling_algorithm: 'Lanczos',
            error_on_image_too_small: false,
            readme_file: false,
            html_code_file: false,
            use_path_as_is: false,
          },
          versioning: true,
        },
      };
      const favIconResponse = await fetch(getCorsFriendlyUrl('https://realfavicongenerator.net/api/favicon'), {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }).then<RealFaviconGenerator.GenerationResponse>(response => response.json());
      const favIconUrls = favIconResponse.favicon_generation_result?.favicon?.files_urls || [];

      await Promise.all([tryRemoveFavicon($icon16), tryRemoveFavicon($icon32), tryRemoveFavicon($iconIco)]);

      [$icon16, $icon32, $iconIco] = await Promise.all([
        saveFavicon(favIconUrls.find(url => url.includes('16x16')) || ''),
        saveFavicon(favIconUrls.find(url => url.includes('32x32')) || ''),
        saveFavicon(favIconUrls.find(url => url.endsWith('.ico')) || ''),
      ]);
    } catch (error) {
      log.error(error);
      $icon16 = '';
      $icon32 = '';
      $iconIco = '';
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    faviconType = $icon16 || $icon32 ? FaviconType.Manual : FaviconType.Default;
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
  <div class="mt-2 flex justify-center">
    <FileButton
      bind:files={iconFileSources}
      name="iconFile"
      button="btn variant-soft"
      on:change={onCustomIconFileChange}>
      <div class="flex flex-row flex-nowrap gap-3 items-center">
        {#if isLoading}
          <ProgressRadial width="w-[32px]" />
        {:else}
          {#if $icon32}
            <img
              class="w-[32px] h-[32px] rounded-sm text-[0]"
              use:opfsSrc={$icon32}
              width="32"
              height="32"
              alt="32x32" />
          {/if}
          {#if $icon16}
            <img
              class="w-[16px] h-[16px] rounded-sm text-[0]"
              use:opfsSrc={$icon16}
              width="16"
              height="16"
              alt="16x16" />
          {/if}
        {/if}
        <span>{m.Favicon_Settings_UploadIcon()}</span>
      </div>
    </FileButton>
  </div>
{/if}
