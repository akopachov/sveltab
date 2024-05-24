import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { paraglide } from '@inlang/paraglide-js-adapter-vite';
import runGeneratorsPlugin from 'vite-plugin-run-generator';
import { isWsl2 } from 'is-wsl2';

export default ({ mode }: { mode: string }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  return defineConfig({
    esbuild: {
      supported: {
        'top-level-await': true,
      },
    },
    server: {
      watch: {
        usePolling: isWsl2(),
      },
    },
    plugins: [
      runGeneratorsPlugin('./src/**/*.tmpl.mjs'),
      sveltekit(),
      paraglide({
        project: './project.inlang',
        outdir: './src/i18n/generated',
      }),
      purgeCss(),
    ],
  });
};
