import * as m from '$i18n/messages';

export const WatchfaceTabId = 1;
export const BackgroundTabId = 2;
export const Tabs = [
  {
    id: WatchfaceTabId,
    title: () => m.Widgets_AnalogueClock_Settings_Tabs_Watchface(),
  },
  {
    id: BackgroundTabId,
    title: () => m.Widgets_AnalogueClock_Settings_Tabs_Background(),
  },
];
