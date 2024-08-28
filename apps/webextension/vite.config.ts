import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { paraglide } from '@inlang/paraglide-sveltekit/vite';
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
    build: {
      target: 'esnext',
      modulePreload: {
        polyfill: false,
      },
      rollupOptions: {
        output: {
          manualChunks: manualChunks,
          minifyInternalExports: true,
        },
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
      sveltekit(),
      paraglide({
        project: './project.inlang',
        outdir: './src/i18n/generated',
      }),
      purgeCss(),
    ],
  });
};

function manualChunks(id: string) {
  const nodeModuleMatch = /\/node_modules\/(?!\.pnpm\/)([^\/]+)\//gi.exec(id);
  const vendorBundle = [
    '@sveltejs',
    'svelte',
    '@skeletonlabs',
    '@floating-ui',
    '@tailwindcss',
    'tailwindcss',
    'debounce',
    'nanoid',
    'p-debounce',
  ];
  if (nodeModuleMatch && vendorBundle.includes(nodeModuleMatch[1])) {
    return 'coreapp';
  }
}
