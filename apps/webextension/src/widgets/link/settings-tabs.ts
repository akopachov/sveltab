import * as m from '$i18n/messages';

export const IconTabId = 1;
export const TextTabId = 2;
export const BackgroundTabId = 3;

export const Tabs = [
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
