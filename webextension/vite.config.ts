import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { paraglide } from '@inlang/paraglide-js-adapter-vite';
import { weatherWidgetVitePlugin } from './src/widgets/weather/vite-plugin';
import defaultWorkspace from './static/default_workspace.json';

const fontSources = new Set<string>();
for (const widget of defaultWorkspace!.widgets!) {
  const fontInfo = widget.extra?.font;
  if (fontInfo?.id && fontInfo?.weight) {
    const fontData = await fetch(`https://api.fontsource.org/v1/fonts/${fontInfo.id}`).then(r => r.json());
    const url = fontData.variants[String(fontInfo.weight)].normal.latin.url;
    fontSources.add(url.woff2 || url.woff || url.ttf);
  }
}

export default defineConfig({
  define: {
    __SVELTAB_DEFAULT_FONTSOURCE_PRELOAD__: `'${[...fontSources].join(';')}'`,
  },
  esbuild: {
    supported: {
      'top-level-await': true,
    },
  },
  plugins: [
    sveltekit(),
    weatherWidgetVitePlugin(),
    paraglide({
      project: './project.inlang',
      outdir: './src/i18n/generated',
    }),
    purgeCss(),
  ],
});
