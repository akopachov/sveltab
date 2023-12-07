import type { WidgetCatalogItem } from '$stores/widgets-catalog';
import { Lazy } from '$lib/lazy';

export const Widget: WidgetCatalogItem = {
  name: 'Dumb widget',
  previewImageUri: '/widgets/dumb/preview.png',
  components: {
    widget: new Lazy(() => import('./dumb.svelte').then(r => r.default)),
    settings: {
      component: new Lazy(() => import('./dumb-settings.svelte').then(r => r.default)),
      tabs: new Lazy(() => import('./dumb-settings-tabs').then(r => r.Tabs)),
      model: new Lazy(() => import('./dumb-settings').then(r => r.DumbSettings))
    }
  },
  settings: {
    type: 'dumb',
    height: 10,
    width: 10
  }
}
