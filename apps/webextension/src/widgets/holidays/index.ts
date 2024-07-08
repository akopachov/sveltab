import type { WidgetCatalogItem } from '$stores/widgets-catalog';
import { WeakLazy } from '$lib/lazy';
import * as m from '$i18n/messages';

export const Widget: WidgetCatalogItem = {
  name: () => m.Widgets_Holidays_Name(),
  components: {
    preview: new WeakLazy(() => import('./preview.svelte').then(r => r.default)),
    widget: new WeakLazy(() => import('./widget.svelte').then(r => r.default)),
    settings: {
      component: new WeakLazy(() => import('./settings.svelte').then(r => r.default)),
      tabs: new WeakLazy(() => import('./settings-tabs').then(r => r.Tabs)),
      model: new WeakLazy(() => import('./settings').then(r => r.Settings)),
    },
  },
  settings: {
    type: 'holidays',
    position: {
      height: 10,
      width: 50,
    },
  },
};
