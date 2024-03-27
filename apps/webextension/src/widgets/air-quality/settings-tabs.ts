import * as m from '$i18n/messages';

export const TextTabId = 1;
export const VariablesTabId = 2;
export const BackgroundTabId = 3;
export const Tabs = [
  {
    id: TextTabId,
    title: () => m.Widgets_AirQuality_Settings_Tabs_Text(),
  },
  {
    id: VariablesTabId,
    title: () => m.Widgets_AirQuality_Settings_Tabs_Variables(),
  },
  {
    id: BackgroundTabId,
    title: () => m.Widgets_AirQuality_Settings_Tabs_Background(),
  },
];
