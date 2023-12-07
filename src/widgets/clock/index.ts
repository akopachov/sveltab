import type { WidgetCatalogItem } from '$stores/widgets-catalog';
import { Lazy } from '$lib/lazy';
import { Tabs } from './clock-settings-tabs';

export const Widget: WidgetCatalogItem = {
  name: 'Clock widget',
  previewImageUri: '/widgets/clock/preview.png',
  components: {
    widget: new Lazy(() => import('./clock.svelte').then(r => r.default)),
    settings: {
      component: new Lazy(() => import('./clock-settings.svelte').then(r => r.default)),
      tabs: new Lazy(() => import('./clock-settings-tabs').then(r => r.Tabs)),
      model: new Lazy(() => import('./clock-settings').then(r => r.ClockSettings))
    }
  },
  settings: {
    type: 'clock',
    height: 20,
    width: 30
  }
}
