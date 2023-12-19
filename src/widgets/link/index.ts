import type { WidgetCatalogItem } from '$stores/widgets-catalog';
import { Lazy } from '$lib/lazy';
import * as m from '$i18n/messages';

export const Widget: WidgetCatalogItem = {
  name: m.Widgets_Link_Name,
  previewImage: new Lazy(() => import('./preview.svg?raw').then(r => r.default)),
  components: {
    widget: new Lazy(() => import('./widget.svelte').then(r => r.default)),
    settings: {
      component: new Lazy(() => import('./settings.svelte').then(r => r.default)),
      tabs: new Lazy(() => import('./settings-tabs').then(r => r.Tabs)),
      model: new Lazy(() => import('./settings').then(r => r.Settings)),
    },
  },
  settings: {
    type: 'link',
    position: {
      height: 15,
      width: 15,
    },
  },
};
