<script lang="ts">
  import * as m from '$i18n/messages';
  import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
  import { debounce, type DebounceOptions } from 'svelte-use-debounce';
  import type { CryptoAssetRef } from './settings';
  import type { CryptoAssetInfo, CryptoAssetsResponse } from './livecoinwatch-api';

  let { asset = $bindable() }: { asset: CryptoAssetRef } = $props();

  const assetsPopupSettings: PopupSettings = {
    event: 'focus-click',
    target: 'Widget_CryptoAssets_Quotation_Settings_Location',
    placement: 'bottom',
  };

  const assetSearchDebounceOpts: DebounceOptions = {
    ms: 500,
    callback: async str => {
      if (str?.length > 2) {
        const response: CryptoAssetsResponse = await fetch(
          `https://http-api.livecoinwatch.com/search?type=c&term=${encodeURIComponent(str)}&limit=10`,
        ).then(r => r.json());
        assetSearchSuggestion = response.data || [];
      } else {
        assetSearchSuggestion = [];
      }
    },
  };
  let assetSearchSuggestion = $state<CryptoAssetInfo[]>([]);

  function selectAsset(newAsset: CryptoAssetInfo) {
    asset = { id: newAsset.code, name: newAsset.name, code: newAsset.code };
    assetSearchSuggestion = [];
  }
</script>

<label class="label">
  <span>
    {m.Widgets_CryptoAssetQuotation_Settings_Asset_Label()}
  </span>
  <input
    class="input"
    type="search"
    value={asset?.name}
    placeholder={m.Widgets_CryptoAssetQuotation_Settings_Asset_Placeholder()}
    use:popup={assetsPopupSettings}
    use:debounce={assetSearchDebounceOpts} />
</label>
<div
  class="card w-fit max-w-[100cqw] max-h-[calc(100cqh-16px)] h-fit overflow-y-auto flex z-[9999] p-2"
  data-popup={assetsPopupSettings.target}
  style:visibility={assetSearchSuggestion.length > 0 ? 'visible' : 'hidden'}>
  <ul class="list">
    {#each assetSearchSuggestion as suggestion}
      <li>
        <button class="btn variant-soft w-full mb-1 rounded-sm flex" onclick={() => selectAsset(suggestion)}>
          <picture class="w-8 h-8 mr-2">
            <source
              srcset="https://lcw.nyc3.cdn.digitaloceanspaces.com/production/currencies/32/{suggestion.code.toLowerCase()}.webp, https://lcw.nyc3.cdn.digitaloceanspaces.com/production/currencies/64/{suggestion.code.toLowerCase()}.webp 2x"
              type="image/webp" />
            <source
              srcset="https://lcw.nyc3.cdn.digitaloceanspaces.com/production/currencies/32/{suggestion.code.toLowerCase()}.png, https://lcw.nyc3.cdn.digitaloceanspaces.com/production/currencies/64/{suggestion.code.toLowerCase()}.png 2x"
              type="image/png" />
            <img
              class="bordered-img"
              src="https://lcw.nyc3.cdn.digitaloceanspaces.com/production/currencies/32/{suggestion.code.toLowerCase()}.png"
              alt="{suggestion.name} price logo"
              srcset="https://lcw.nyc3.cdn.digitaloceanspaces.com/production/currencies/64/{suggestion.code.toLowerCase()}.png 2x"
              width="30"
              height="30" />
          </picture>
          <span class="flex-auto">
            {suggestion.name} ({suggestion.code})
          </span>
        </button>
      </li>
    {/each}
  </ul>
</div>
