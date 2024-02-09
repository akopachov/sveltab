import * as m from '$i18n/messages';
import { PUBLIC_EXTERNAL_ASSETS_URI } from '$env/static/public';

const WatchfaceKeys = ['default', 'variant-1', 'variant-2', 'variant-3'] as const;

export type WatchfaceKey = (typeof WatchfaceKeys)[number];

export type Watchface = { name: () => string; uri: string };

export const Watchfaces: ReadonlyMap<WatchfaceKey, Watchface> = new Map([
  [
    'default',
    {
      name: m.Widgets_AnalogueClock_Settings_Watchface_Default_Name,
      uri: `${PUBLIC_EXTERNAL_ASSETS_URI}/widgets/analogue-clock/faces/default.svg`,
    },
  ],
  [
    'variant-1',
    {
      name: m.Widgets_AnalogueClock_Settings_Watchface_Variant1_Name,
      uri: `${PUBLIC_EXTERNAL_ASSETS_URI}/widgets/analogue-clock/faces/variant-1.svg`,
    },
  ],
  [
    'variant-2',
    {
      name: m.Widgets_AnalogueClock_Settings_Watchface_Variant2_Name,
      uri: `${PUBLIC_EXTERNAL_ASSETS_URI}/widgets/analogue-clock/faces/variant-2.svg`,
    },
  ],
  [
    'variant-3',
    {
      name: m.Widgets_AnalogueClock_Settings_Watchface_Variant3_Name,
      uri: `${PUBLIC_EXTERNAL_ASSETS_URI}/widgets/analogue-clock/faces/variant-3.svg`,
    },
  ],
]);
