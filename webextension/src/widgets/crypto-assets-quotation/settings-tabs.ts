import * as m from '$i18n/messages';

export const ChartTabId = 1;
export const TextTabId = 2;
export const BackgroundTabId = 3;
export const Tabs = [
  {
    id: ChartTabId,
    title: () => m.Widgets_CryptoAssetQuotation_Settings_Tabs_Chart(),
  },
  {
    id: TextTabId,
    title: () => m.Widgets_CryptoAssetQuotation_Settings_Tabs_Text(),
  },
  {
    id: BackgroundTabId,
    title: () => m.Widgets_CryptoAssetQuotation_Settings_Tabs_Background(),
  },
];
