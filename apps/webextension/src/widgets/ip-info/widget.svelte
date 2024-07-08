<script lang="ts">
  import { NetworkInfoVariables, type Settings } from './settings';
  import { fontsource } from '$actions/fontsource';
  import { userPosssibleLocaleCharSubset } from '$stores/locale';
  import { getGeoIpInfo, type IpApiCoResponse } from '$lib/ipapi-co';
  import { logger } from '$lib/logger';
  import { onMount } from 'svelte';
  import { online } from '$stores/online-store';

  const log = logger.getSubLogger({ prefix: ['Widget', 'Ip Info'] });

  export let settings: Settings;

  let ipInfo: IpApiCoResponse | null = null;

  $: {
    $online && updateIpInfo();
  }

  const {
    backgroundColor,
    backgroundBlur,
    textColor,
    font: { id: fontId, weight: fontWeight },
    textShadow: {
      offsetX: textShadowOffsetX,
      offsetY: textShadowOffsetY,
      blur: textShadowBlur,
      color: textShadowColor,
    },
    showVariables,
  } = settings;

  async function updateIpInfo() {
    if (!navigator.onLine) {
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
  style:background-color={$backgroundColor}
  style:color={$textColor}
  style:font-weight={$fontWeight}
  style:--st-blur="{$backgroundBlur}px"
  style:text-shadow="{$textShadowOffsetX}cqmin {$textShadowOffsetY}cqmin {$textShadowBlur}cqmin
  {$textShadowColor}"
  style:--st-font-size="{$showVariables.length > 0 ? 48 / $showVariables.length : 0}cqh"
  use:fontsource={{
    font: $fontId,
    subsets: $userPosssibleLocaleCharSubset,
    styles: ['normal'],
    weights: [$fontWeight],
  }}>
  <div
    class="grid grid-cols-[auto_1fr] w-full leading-normal text-[length:var(--st-font-size)]"
    style:grid-template-rows="repeat({$showVariables.length}, {100 / $showVariables.length}%)">
    {#if $showVariables.includes(NetworkInfoVariables.IP)}
      <div class="whitespace-nowrap pr-2 content-center">IP:</div>
      <div class="whitespace-nowrap overflow-hidden text-ellipsis content-center">
        <span title={ipInfo?.ip}>{ipInfo?.ip ?? '---'}</span>
      </div>
    {/if}

    {#if $showVariables.includes(NetworkInfoVariables.Network)}
      <div class="whitespace-nowrap pr-2 content-center">Network:</div>
      <div class="whitespace-nowrap overflow-hidden text-ellipsis content-center">
        <span title={ipInfo?.network}>{ipInfo?.network ?? '---'}</span>
      </div>
    {/if}

    {#if $showVariables.includes(NetworkInfoVariables.ISP)}
      <div class="whitespace-nowrap pr-2 content-center">ISP:</div>
      <div class="whitespace-nowrap overflow-hidden text-ellipsis content-center">
        <span title={ipInfo?.org}>{ipInfo?.org ?? '---'}</span>
      </div>
    {/if}
  </div>
</div>
