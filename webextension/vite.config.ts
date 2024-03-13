import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { paraglide } from '@inlang/paraglide-js-adapter-vite';
import { runGenerators } from './vite-plugin-run-generators';

export default defineConfig({
  esbuild: {
    supported: {
      'top-level-await': true,
    },
  },
  plugins: [
    sveltekit(),
    ...(await runGenerators({ searchPath: './src/**/*.tmpl.mjs' })),
    paraglide({
      project: './project.inlang',
      outdir: './src/i18n/generated',
    }),
    purgeCss(),
  ],
});
