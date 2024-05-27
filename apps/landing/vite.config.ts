import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { isWsl2 } from 'is-wsl2';

export default async () => {
  return defineConfig({
    esbuild: {
      supported: {
        'top-level-await': true,
      },
    },
    server: {
      watch: {
        usePolling: await isWsl2(),
      },
    },
    plugins: [enhancedImages(), sveltekit()],
  });
};
