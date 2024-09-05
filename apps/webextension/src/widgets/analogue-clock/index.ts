import type { WidgetCatalogItem } from '../types';
import { WeakLazy } from '$lib/lazy';
import * as m from '$i18n/messages';

export const Widget: WidgetCatalogItem = {
  name: () => m.Widgets_AnalogueClock_Name(),
  components: {
    widget: new WeakLazy(() => import('./widget.svelte').then(r => r.default)),
    preview: new WeakLazy(() => import('./preview.svelte').then(r => r.default)),
    settings: {
      component: new WeakLazy(() => import('./settings.svelte').then(r => r.default)),
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
