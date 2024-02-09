import type { WidgetCatalogItem } from '$stores/widgets-catalog';
import { Lazy } from '$lib/lazy';
import * as m from '$i18n/messages';

export const Widget: WidgetCatalogItem = {
  name: () => m.Widgets_AnalogueClock_Name(),
  components: {
    widget: new Lazy(() => import('./widget.svelte').then(r => r.default)),
    preview: new Lazy(() => import('./preview.svelte').then(r => r.default)),
    settings: {
      component: new Lazy(() => import('./settings.svelte').then(r => r.default)),
      tabs: new Lazy(() => import('./settings-tabs').then(r => r.Tabs)),
      model: new Lazy(() => import('./settings').then(r => r.AnalogueClockSettings)),
    },
  },
  settings: {
    type: 'analogue-clock',
    position: {
      height: 30,
      width: 30,
    },
    keepRatio: false,
  },
};
