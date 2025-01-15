import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import runGeneratorsPlugin from 'vite-plugin-run-generator';
import { isWsl2 } from 'is-wsl2';

export default async ({ mode }: { mode: string }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  const usePooling = await isWsl2();
  return defineConfig({
    esbuild: {
      supported: {
        'top-level-await': true,
      },
    },
    server: {
      watch: {
        usePolling: usePooling,
        interval: usePooling ? 1000 : undefined,
      },
    },
    plugins: [
      runGeneratorsPlugin('./src/**/*.tmpl.mjs'),
      paraglideVitePlugin({
        project: './project.inlang',
        outdir: './src/i18n/generated',
      }),
      sveltekit(),
      purgeCss(),
    ],
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    assetsInclude: ['**/*.wasm'],
  });
};
