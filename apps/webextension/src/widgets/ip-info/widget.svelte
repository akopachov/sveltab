<script lang="ts">
  import { NetworkInfoVariables, type Settings } from './settings';
  import { fontsource } from '$actions/fontsource';
  import { userPosssibleLocaleCharSubset } from '$stores/locale';
  import { getGeoIpInfo, type IpApiCoResponse } from '$lib/ipapi-co';
  import { logger } from '$lib/logger';
  import { onMount } from 'svelte';
  import { online } from '$stores/online-store';
  import { textStroke } from '$actions/text-stroke';

  const log = logger.getSubLogger({ prefix: ['Widget', 'Ip Info'] });

  let { settings }: { settings: Settings } = $props();

  let ipInfo: IpApiCoResponse | undefined | null = $state();

  $effect(() => {
    void $online;
    updateIpInfo();
  });

  async function updateIpInfo() {
    if (!$online) {
      ipInfo = null;
      return;
    }

    try {
      ipInfo = await getGeoIpInfo();
    } catch (error) {
      log.error('Failed to fetch network info', error);
    }
  }

  onMount(() => {
    updateIpInfo();
  });
</script>

<div
  class="w-full h-full p-4 select-none flex justify-center content-center flex-col overflow-hidden hover:overflow-y-auto rounded-[inherit] backdrop-blur-[var(--st-blur)]"
  style:background-color={settings.backgroundColor.value}
  style:color={settings.textColor.value}
  style:font-weight={settings.font.weight.value}
  style:--st-blur="{settings.backgroundBlur.value}px"
  style:text-shadow="{settings.textShadow.offsetX.value}cqmin {settings.textShadow.offsetY.value}cqmin {settings
    .textShadow.blur.value}cqmin
  {settings.textShadow.color.value}"
  style:--st-font-size="{settings.showVariables.value.length > 0 ? 48 / settings.showVariables.value.length : 0}cqh"
  use:fontsource={{
    font: settings.font.id.value,
    subsets: $userPosssibleLocaleCharSubset,
    styles: ['normal'],
    weights: [settings.font.weight.value],
  }}
  use:textStroke={settings.textStroke}>
  <div
    class="grid grid-cols-[auto_1fr] w-full leading-normal text-[length:var(--st-font-size)] [-webkit-text-stroke:var(--sv-text-stroke)]"
    style:grid-template-rows="repeat({settings.showVariables.value.length}, {100 /
      settings.showVariables.value.length}%)">
    {#if settings.showVariables.value.includes(NetworkInfoVariables.IP)}
      <div class="whitespace-nowrap pr-2 content-center">IP:</div>
      <div class="whitespace-nowrap overflow-hidden text-ellipsis content-center">
        <span title={ipInfo?.ip}>{ipInfo?.ip ?? '---'}</span>
      </div>
    {/if}

    {#if settings.showVariables.value.includes(NetworkInfoVariables.Network)}
      <div class="whitespace-nowrap pr-2 content-center">Network:</div>
      <div class="whitespace-nowrap overflow-hidden text-ellipsis content-center">
        <span title={ipInfo?.network}>{ipInfo?.network ?? '---'}</span>
      </div>
    {/if}

    {#if settings.showVariables.value.includes(NetworkInfoVariables.ISP)}
      <div class="whitespace-nowrap pr-2 content-center">ISP:</div>
      <div class="whitespace-nowrap overflow-hidden text-ellipsis content-center">
        <span title={ipInfo?.org}>{ipInfo?.org ?? '---'}</span>
      </div>
    {/if}
  </div>
</div>
