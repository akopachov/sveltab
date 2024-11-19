<script module lang="ts">
  import * as m from '$i18n/messages';

  const IconTabId = 1;
  const TextTabId = 2;
  const BackgroundTabId = 3;

  const Tabs = [
    {
      id: IconTabId,
      title: () => m.Widgets_Link_Settings_Tabs_Icon(),
    },
    {
      id: TextTabId,
      title: () => m.Widgets_Link_Settings_Tabs_Text(),
    },
    {
      id: BackgroundTabId,
      title: () => m.Widgets_Link_Settings_Tabs_Background(),
    },
  ];
</script>

<script lang="ts">
  import { IconSource, type Settings } from './settings';
  import { GeneralTabId } from '$shared-components/widget-settings.svelte';
  import IconifySearch from './iconify-search.svelte';
  import TextSettings from '$shared-components/text-settings.svelte';
  import BackgroundSettings from '$shared-components/background-settings.svelte';
  import { onMount } from 'svelte';
  import type { InternalAssetsManager } from '$lib/internal-assets-manager';
  import BrowserSupports, { Constraints } from '$shared-components/browser-supports.svelte';
  import { FileButton } from '@skeletonlabs/skeleton';
  import { logger } from '$lib/logger';
  import { OpfsSchema } from '$lib/opfs';
  import { getFileExtension } from '$lib/path-utils';

  const log = logger.getSubLogger({ prefix: ['Widget', 'Link'] });

  let {
    id,
    settings,
    tab,
    tabs = $bindable(),
    internalAssetsManager,
  }: {
    id: string;
    settings: Settings;
    tab: number;
    tabs: object[];
    internalAssetsManager: InternalAssetsManager;
  } = $props();

  let iconFileSources: FileList | undefined = $state();

  export async function onDelete() {
    if (settings.iconSource.value === IconSource.Local && settings.icon.value) {
      try {
        internalAssetsManager.removeAsset(settings.icon.value);
      } catch (e) {
        log.warn(e);
      }
    }
  }

  function onIconSourceChange() {
    if (settings.iconSource.value !== IconSource.Local && settings.icon.value?.startsWith(OpfsSchema) === true) {
      try {
        internalAssetsManager.removeAsset(settings.icon.value);
      } catch (e) {
        log.warn(e);
      }
    }
    settings.icon.value = '';
  }

  async function onCustomIconFileChange() {
    if (iconFileSources && iconFileSources.length > 0) {
      const file = iconFileSources[0];
      const internalPath = `widgets/${id}/manual_icon.${getFileExtension(file.name)}`;
      settings.icon.value = await internalAssetsManager.addAsset(internalPath, file);
    }
  }

  onMount(() => {
    tabs = Tabs;
  });
</script>

{#if tab === GeneralTabId}
  <label class="label">
    <span>{m.Widgets_Link_Settings_Link_Label()}</span>
    <input
      type="url"
      class="input"
      bind:value={settings.url.value}
      placeholder={m.Widgets_Link_Settings_Link_Placeholder()} />
  </label>
  <label class="label">
    <span>{m.Widgets_Link_Settings_Title_Label()}</span>
    <input type="text" class="input" bind:value={settings.title.value} />
  </label>
{:else if tab === IconTabId}
  <label class="label mb-2">
    <span>{m.Widgets_Link_Settings_IconSource()}</span>
    <select class="select" bind:value={settings.iconSource.value} onchange={onIconSourceChange}>
      <option value={IconSource.Favicon}>{m.Widgets_Link_Settings_IconSource_Favicon()}</option>
      <option value={IconSource.Iconify}>{m.Widgets_Link_Settings_IconSource_Iconify()}</option>
      <option value={IconSource.Direct}>{m.Widgets_Link_Settings_IconSource_Direct()}</option>
      <option value={IconSource.Local}>{m.Widgets_Link_Settings_IconSource_Local()}</option>
    </select>
  </label>
  {#if settings.iconSource.value === IconSource.Direct}
    <label class="label">
      <span>{m.Widgets_Link_Settings_IconSource_Direct_Label()}</span>
      <input
        type="url"
        class="input"
        bind:value={settings.icon.value}
        placeholder={m.Widgets_Link_Settings_IconSource_Direct_Placeholder()} />
    </label>
  {:else if settings.iconSource.value === IconSource.Iconify}
    <IconifySearch bind:icon={settings.icon.value} bind:color={settings.iconColor.value} />
  {:else if settings.iconSource.value === IconSource.Local}
    <BrowserSupports constraint={Constraints.OPFS} class="mt-4">
      <div class="mt-2 flex justify-center">
        <FileButton
          bind:files={iconFileSources}
          name="iconFile"
          button="btn variant-soft"
          on:change={onCustomIconFileChange}>
          <span>{m.Widgets_Link_Settings_IconSource_Local_Select()}</span>
        </FileButton>
      </div>
    </BrowserSupports>
  {/if}
{:else if tab === TextTabId}
  <TextSettings
    font={settings.font}
    bind:color={settings.textColor.value}
    shadow={settings.textShadow}
    stroke={settings.textStroke} />
{:else if tab === BackgroundTabId}
  <BackgroundSettings bind:color={settings.backgroundColor.value} bind:blur={settings.backgroundBlur.value} />
{/if}
