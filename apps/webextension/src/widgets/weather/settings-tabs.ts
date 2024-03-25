import * as m from '$i18n/messages';

export const TextTabId = 1;
export const LayoutTabId = 2;
export const BackgroundTabId = 3;
export const Tabs = [
  {
    id: TextTabId,
    title: () => m.Widgets_Weather_Settings_Tabs_Text(),
  },
  {
    id: LayoutTabId,
    title: () => m.Widgets_Weather_Settings_Tabs_Layout(),
  },
  {
    id: BackgroundTabId,
    title: () => m.Widgets_Weather_Settings_Tabs_Background(),
  },
];
