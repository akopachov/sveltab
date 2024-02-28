import { type Handle } from '@sveltejs/kit';
import defaultWorkspace from '../static/default_workspace.json';
import type { ResourceInfo } from '$stores/preload-resources';

const resourcesToPreload = new Set<ResourceInfo>();
for (const widget of defaultWorkspace!.widgets!) {
  const fontInfo = widget.extra?.font;
  if (fontInfo?.id && fontInfo?.weight) {
    const fontData = await fetch(`https://api.fontsource.org/v1/fonts/${fontInfo.id}`).then(r => r.json());
    const url = fontData.variants[String(fontInfo.weight)].normal.latin.url;
    resourcesToPreload.add({
      src: url.woff2 || url.woff || url.ttf,
      type: url.woff2 ? 'woff2' : url.woff ? 'woff' : 'ttf',
      as: 'font',
    });
  }
}

if (defaultWorkspace!.background?.type === 'static-image') {
  resourcesToPreload.add({ src: (<any>defaultWorkspace!.background?.extra)?.url, as: 'image' });
}

const resourcesToPreloadAsString = JSON.stringify(JSON.stringify([...resourcesToPreload]));

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event, {
    transformPageChunk: ({ html }) => {
      return html.replace('__SVELTAB_EXTERNAL_RESOURCES_PRELOAD__', resourcesToPreloadAsString);
    },
  });
  return response;
};
