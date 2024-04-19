import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { purgeCss } from 'vite-plugin-tailwind-purgecss';

export default defineConfig({
  plugins: [enhancedImages(), sveltekit(), purgeCss()],
});
