import { ImageBackgroundProviderSettingsBase } from '$backgrounds/common-image/settings-base';
import type { BackgroundSettingsExtraInitial } from '$lib/background-settings';
import { useObservable, type Observable } from '$lib/observable.svelte';
import { OpfsSchema } from '$lib/opfs';
import type { WorkspaceInstance } from '$lib/workspace-instance';

export const enum StaticImageSource {
  Url = 'url',
  Local = 'local',
}

export class Settings extends ImageBackgroundProviderSettingsBase {
  constructor(initial: BackgroundSettingsExtraInitial<Settings>) {
    super(initial);
    this.url = useObservable(initial.url || '');
    this.source = useObservable(initial.source || StaticImageSource.Url);
  }

  readonly url: Observable<string>;
  readonly source: Observable<StaticImageSource>;
}

export async function onRemove(workspace: WorkspaceInstance) {
  const url = (workspace.background.value.settings.extra as Settings).url;
  if (url.value.startsWith(OpfsSchema)) {
    await workspace.internalAssetsManager.removeAsset(url.value);
    url.value = '';
  }
}
