import { PUBLIC_EXTERNAL_ASSETS_URI } from '$env/static/public';
import { WeakLazy } from '$lib/lazy';
import type { BaseAssetsPack } from './asset-pack-base';
import * as m from '$i18n/messages';
import { ModernAssetsPack } from './generated/modern';
import { IconifyAssetsPack } from './generated/iconify';
import { IconifyMainUrl } from '$lib/iconify-api';

// https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM

export type AssetPackInfo = {
  name: () => string;
  assetPack: WeakLazy<BaseAssetsPack>;
};

export const DefaultAssetsPack = {
  name: () => m.Widgets_Weather_AssetPack_Default_Name(),
  assetPack: new WeakLazy<BaseAssetsPack>(
    () => new ModernAssetsPack(`${PUBLIC_EXTERNAL_ASSETS_URI}/widgets/weather/asset-packs/default`),
  ),
};

export const AssetsPacks: ReadonlyMap<string, AssetPackInfo> = new Map([
  ['default', DefaultAssetsPack],
  [
    'iconify',
    {
      name: () => m.Widgets_Weather_AssetPack_Iconify_Name(),
      assetPack: new WeakLazy<BaseAssetsPack>(() => new IconifyAssetsPack(IconifyMainUrl)),
    },
  ],
]);
