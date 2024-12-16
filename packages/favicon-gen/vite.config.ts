import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
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
