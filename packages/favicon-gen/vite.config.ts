import { defineConfig } from 'vite';
import arraybuffer from 'vite-plugin-arraybuffer';
import { resolve } from 'path';

export default defineConfig({
  plugins: [arraybuffer()],
  esbuild: {
    supported: {
      'top-level-await': true,
    },
  },
  build: {
    lib: { entry: resolve(__dirname, 'src/index.ts'), formats: ['es'] },
    outDir: resolve(__dirname, 'dist/'),
    emptyOutDir: true,
  },
  resolve: { alias: { src: resolve('src/') } },
  assetsInclude: ['**/*.wasm'],
});
