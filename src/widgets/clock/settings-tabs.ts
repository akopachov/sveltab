import * as m from '$i18n/messages';

export const TextTabId = 1;
export const BackgroundTabId = 2;
export const Tabs = [
  {
    id: TextTabId,
    title: () => m.Widgets_Clock_Settings_Tabs_Text(),
  },
  {
    id: BackgroundTabId,
    title: () => m.Widgets_Clock_Settings_Tabs_Background(),
  },
];
