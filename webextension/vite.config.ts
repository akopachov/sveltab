import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { paraglide } from '@inlang/paraglide-js-adapter-vite';
import { weatherWidgetVitePlugin } from './src/widgets/weather/vite-plugin';

export default defineConfig({
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
