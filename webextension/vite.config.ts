import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { paraglide } from '@inlang/paraglide-js-adapter-vite';
import { run } from 'vite-plugin-run';
import glob from 'tiny-glob';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const generators = [];
const generatorFiles = await glob('src/**/*.gen.mjs', { cwd: __dirname, absolute: true, dot: true, filesOnly: true });
for (const generatorFile of generatorFiles) {
  console.log(`Loading generator from ${generatorFile}`);
  const generatorFileUrl = pathToFileURL(generatorFile).toString();
  const generator = await import(generatorFileUrl).then(m => m.default);
  const generatorDir = dirname(fileURLToPath(generatorFileUrl));
  const watchPatterns = (generator.pattern || []).map((p: string) => resolve(generatorDir, p));
  generators.push(
    run({
      input: [
        {
          name: generator.name,
          run: [process.argv[0], '--env-file', '.env', '-e', `import("${generatorFileUrl}").then(a => a.main());`],
          pattern: [generatorFile, ...watchPatterns],
        },
      ],
      silent: false,
    }),
  );
}

export default defineConfig({
  esbuild: {
    supported: {
      'top-level-await': true,
    },
  },
  plugins: [
    sveltekit(),
    ...generators,
    paraglide({
      project: './project.inlang',
      outdir: './src/i18n/generated',
    }),
    purgeCss(),
  ],
});
