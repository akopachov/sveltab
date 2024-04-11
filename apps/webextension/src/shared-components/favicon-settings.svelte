<script lang="ts">
  import { opfsSrc } from '$actions/opfs-src';
  import { PUBLIC_REALFAVICON_API_KEY } from '$env/static/public';
  import { getCorsFriendlyUrl } from '$lib/cors-bypass.gen';
  import type { WorkspaceInstance } from '$lib/workspace-instance';
  import { FileButton, ProgressRadial, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
  import { nanoid } from 'nanoid/non-secure';
  import { onMount } from 'svelte';

  export let workspaceInstance: WorkspaceInstance | undefined;

  $: icon16 = workspaceInstance?.favicon[16];
  $: icon32 = workspaceInstance?.favicon[32];
  $: iconIco = workspaceInstance?.favicon.ico;

  enum FaviconType {
    Default = 'default',
    Manual = 'manual',
  }

  interface FaviconGenerationResponse {
    favicon_generation_result: {
      result: {
        status: string;
      };
      favicon: FaviconInfo;
      files_location: {
        type: string;
        path: string;
      };
      preview_picture_url: string;
      version: string;
    };
  }

  interface FaviconInfo {
    package_url: string;
    files_urls: string[];
    html_code: string;
    compression: string;
    overlapping_markups: string[];
  }

  let faviconType: FaviconType;
  let iconFileSources: FileList;
  let isLoading = false;

  async function saveFavicon(opfsRoot: FileSystemDirectoryHandle, url: string) {
    if (!url) {
      return '';
    }
    const response = await fetch(url);
    const blob = await response.blob();
    const fileExtension = url.split('.').pop();
    const fileName = `favicon-${nanoid()}.${fileExtension}`;
    const fileHandle = await opfsRoot.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
    return `opfs://${fileName}`;
  }

  async function tryRemoveFavicon(opfsRoot: FileSystemDirectoryHandle, fileName: string | undefined) {
    if (!fileName || !fileName.startsWith('opfs://')) {
      return;
    }

    try {
      await opfsRoot.removeEntry(fileName.substring(7));
    } catch (error) {
      console.error(error);
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
      const opfsRoot = await navigator.storage.getDirectory();
      await Promise.all([
        tryRemoveFavicon(opfsRoot, $icon16),
        tryRemoveFavicon(opfsRoot, $icon32),
        tryRemoveFavicon(opfsRoot, $iconIco),
      ]);
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
      const requestBody = {
        favicon_generation: {
          api_key: PUBLIC_REALFAVICON_API_KEY,
          master_picture: {
            type: 'inline',
            content: await fileToBase64(iconFileSources[0]),
          },
          files_location: {
            type: 'path',
            path: '/',
          },
          favicon_design: {
            desktop_browser: {},
          },
          settings: {
            compression: '3',
            scaling_algorithm: 'Mitchell',
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
      }).then<FaviconGenerationResponse>(response => response.json());
      const favIconUrls = favIconResponse.favicon_generation_result?.favicon?.files_urls || [];

      const opfsRoot = await navigator.storage.getDirectory();

      await Promise.all([
        tryRemoveFavicon(opfsRoot, $icon16),
        tryRemoveFavicon(opfsRoot, $icon32),
        tryRemoveFavicon(opfsRoot, $iconIco),
      ]);

      [$icon16, $icon32, $iconIco] = await Promise.all([
        saveFavicon(opfsRoot, favIconUrls.find(url => url.includes('16x16')) || ''),
        saveFavicon(opfsRoot, favIconUrls.find(url => url.includes('32x32')) || ''),
        saveFavicon(opfsRoot, favIconUrls.find(url => url.endsWith('.ico')) || ''),
      ]);
    } catch (error) {
      console.error(error);
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
    Default
  </RadioItem>
  <RadioItem bind:group={faviconType} name="favicon_manual" value={FaviconType.Manual}>Manual</RadioItem>
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
        <span>Upload icon</span>
      </div>
    </FileButton>
  </div>
{/if}
