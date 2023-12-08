import type { WidgetCatalogItem } from '$stores/widgets-catalog';
import { Lazy } from '$lib/lazy';

export const Widget: WidgetCatalogItem = {
  name: 'Clock widget',
  previewImageUri: '/widgets/clock/preview.png',
  components: {
    widget: new Lazy(() => import('./widget.svelte').then(r => r.default)),
    settings: {
      component: new Lazy(() => import('./settings.svelte').then(r => r.default)),
      tabs: new Lazy(() => import('./settings-tabs').then(r => r.Tabs)),
      model: new Lazy(() => import('./settings').then(r => r.Settings))
    }
  },
  settings: {
    type: 'clock',
    position: {
      height: 20,
      width: 30
    }
  }
}
