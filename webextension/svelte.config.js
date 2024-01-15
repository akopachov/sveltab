import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { fastDimension } from 'svelte-fast-dimension';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import * as child_process from 'node:child_process';

const file = fileURLToPath(new URL('package.json', import.meta.url));
const json = readFileSync(file, 'utf8');
const pkg = JSON.parse(json);

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: [fastDimension(), vitePreprocess()],

  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter(),
    appDir: 'app',
    alias: {
      '$shared-components': 'src/shared-components',
      $stores: 'src/stores',
      $widgets: 'src/widgets',
      $backgrounds: 'src/backgrounds',
      $actions: 'src/actions',
      $i18n: 'src/i18n/generated',
    },
    paths: {
      relative: false,
    },
    version: {
      name: `${pkg.version}+${child_process.execSync('git rev-parse --short HEAD').toString().trim()}`,
    },
  },
};

export default config;
