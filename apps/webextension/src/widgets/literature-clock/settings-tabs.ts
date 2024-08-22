import * as m from '$i18n/messages';

export const TextTabId = 1;
export const TimeTabId = 2;
export const BackgroundTabId = 3;
export const Tabs = [
  {
    id: TextTabId,
    title: () => m.Widgets_LiteratureClock_Settings_Tabs_Text(),
  },
  {
    id: TimeTabId,
    title: () => m.Widgets_LiteratureClock_Settings_Tabs_Time(),
  },
  {
    id: BackgroundTabId,
    title: () => m.Widgets_LiteratureClock_Settings_Tabs_Background(),
  },
];
