<script lang="ts">
  import * as m from '$i18n/messages';
  import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
  import { debounce, type DebounceOptions } from 'svelte-use-debounce';
  import type { CryptoAssetRef } from './settings';
  import type { CoincapioAsset, CoincapioAssetsResponse } from './coincapio-api';

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
        const response: CoincapioAssetsResponse = await fetch(
          `https://api.coincap.io/v2/assets?search=${encodeURIComponent(str)}&limit=15`,
        ).then(r => r.json());
        assetSearchSuggestion = response.data || [];
      } else {
        assetSearchSuggestion = [];
      }
    },
  };
  let assetSearchSuggestion: Required<CoincapioAsset>[] = $state([]);

  function selectAsset(newAsset: Required<CoincapioAsset>) {
    asset = { id: newAsset.id, name: newAsset.name, code: newAsset.symbol };
    assetSearchSuggestion = [];
  }
</script>

<label class="label">
  <span>{m.Widgets_CryptoAssetQuotation_Settings_Asset_Label()}</span>
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
        <button class="btn variant-soft w-full mb-1 rounded-sm" onclick={() => selectAsset(suggestion)}>
          <span class="flex-auto">
            {suggestion.name} ({suggestion.symbol})
          </span>
        </button>
      </li>
    {/each}
  </ul>
</div>
