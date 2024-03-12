import type { WidgetCatalogItem } from '$stores/widgets-catalog';
import { WeakLazy } from '$lib/lazy';
import * as m from '$i18n/messages';

export const Widget: WidgetCatalogItem = {
  name: () => m.Widgets_AnalogueClock_Name(),
  components: {
    widget: new WeakLazy(() => import('./widget.svelte').then(r => r.default)),
    preview: new WeakLazy(() => import('./preview.svelte').then(r => r.default)),
    settings: {
      component: new WeakLazy(() => import('./settings.svelte').then(r => r.default)),
      tabs: new WeakLazy(() => import('./settings-tabs').then(r => r.Tabs)),
      model: new WeakLazy(() => import('./settings').then(r => r.AnalogueClockSettings)),
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
