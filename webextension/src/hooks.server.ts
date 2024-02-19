import defaultWorkspace from '../static/default_workspace.json';

export async function handle({ event, resolve }) {
  const fontSources: string[] = [];
  for (const widget of defaultWorkspace!.widgets!) {
    const fontInfo = widget.extra?.font;
    if (fontInfo?.id && fontInfo?.weight) {
      const fontData = await fetch(`https://api.fontsource.org/v1/fonts/${fontInfo.id}`).then(r => r.json());
      const url = fontData.variants[String(fontInfo.weight)].normal.latin.url;
      fontSources.push(url.woff2 || url.woff || url.ttf);
    }
  }

  return await resolve(event, {
    transformPageChunk: ({ html }) => html.replace('$$DEFAULT_FONTSOURCE_PRELOAD$$', `"${fontSources.join(';')}"`),
  });
}
