import * as m from '$i18n/messages';

export const TypesTabId = 1;
export const TextTabId = 2;
export const BackgroundTabId = 3;
export const Tabs = [
  {
    id: TypesTabId,
    title: () => m.Widgets_Holidays_Settings_Tabs_Types(),
  },
  {
    id: TextTabId,
    title: () => m.Widgets_Holidays_Settings_Tabs_Text(),
  },
  {
    id: BackgroundTabId,
    title: () => m.Widgets_Holidays_Settings_Tabs_Background(),
  },
];
