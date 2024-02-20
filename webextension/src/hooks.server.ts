import { type Handle } from '@sveltejs/kit';
import defaultWorkspace from '../static/default_workspace.json';

const fontSources = new Set<string>();
for (const widget of defaultWorkspace!.widgets!) {
  const fontInfo = widget.extra?.font;
  if (fontInfo?.id && fontInfo?.weight) {
    const fontData = await fetch(`https://api.fontsource.org/v1/fonts/${fontInfo.id}`).then(r => r.json());
    const url = fontData.variants[String(fontInfo.weight)].normal.latin.url;
    fontSources.add(url.woff2 || url.woff || url.ttf);
  }
}

const fontSourcePlain = JSON.stringify([...fontSources].join(';'));

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event, {
    transformPageChunk: ({ html }) => {
      return html.replace('__SVELTAB_DEFAULT_FONTSOURCE_PRELOAD__', fontSourcePlain);
    },
  });
  return response;
};
