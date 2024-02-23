import { type Handle } from '@sveltejs/kit';
import defaultWorkspace from '../static/default_workspace.json';

const fontSources = new Set<{ src: string; type: string }>();
for (const widget of defaultWorkspace!.widgets!) {
  const fontInfo = widget.extra?.font;
  if (fontInfo?.id && fontInfo?.weight) {
    const fontData = await fetch(`https://api.fontsource.org/v1/fonts/${fontInfo.id}`).then(r => r.json());
    const url = fontData.variants[String(fontInfo.weight)].normal.latin.url;
    fontSources.add({ src: url.woff2 || url.woff || url.ttf, type: url.woff2 ? 'woff2' : url.woff ? 'woff' : 'ttf' });
  }
}

const fontSourcePlain = JSON.stringify(
  JSON.stringify([...fontSources].map(s => ({ src: s.src, as: 'font', type: s.type }))),
);

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event, {
    transformPageChunk: ({ html }) => {
      return html.replace('__SVELTAB_EXTERNAL_RESOURCES_PRELOAD__', fontSourcePlain);
    },
  });
  return response;
};
