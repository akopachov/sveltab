import type { WidgetCatalogItem } from '../types';
import { WeakLazy } from '$lib/lazy';
import * as m from '$i18n/messages';

export const Widget: WidgetCatalogItem = {
  name: () => m.Widgets_AdviceSlip_Name(),
  components: {
    preview: new WeakLazy(() => import('./preview.svelte').then(r => r.default)),
    widget: new WeakLazy(() => import('./widget.svelte').then(r => r.default)),
    settings: {
      component: new WeakLazy(() => import('./settings.svelte').then(r => r.default)),
      model: new WeakLazy(() => import('./settings').then(r => r.Settings)),
    },
  },
  settings: {
    type: 'advice-slip',
    position: {
      height: 10,
      width: 50,
    },
  },
};
