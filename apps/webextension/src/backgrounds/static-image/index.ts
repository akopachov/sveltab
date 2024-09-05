import { WeakLazy } from '$lib/lazy';
import type { BackgroundCatalogItem } from '../types';
import * as m from '$i18n/messages';
import type { WorkspaceInstance } from '$lib/workspace-instance';

export const Background: BackgroundCatalogItem = {
  name: m.Backgrounds_StaticImage_Name,
  components: {
    provider: new WeakLazy(() => import('./provider').then(r => r.StaticImageBackgroundProvider)),
    settings: {
      component: new WeakLazy(() => import('./settings.svelte').then(r => r.default)),
      model: new WeakLazy(() => import('./settings').then(r => r.Settings)),
    },
  },
  settings: {
    type: 'static-image',
  },
  lifecycle: {
    onRemove: async (workspace: WorkspaceInstance) => await import('./settings').then(r => r.onRemove(workspace)),
  },
};
