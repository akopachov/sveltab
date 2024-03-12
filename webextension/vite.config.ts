import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { paraglide } from '@inlang/paraglide-js-adapter-vite';
import { run } from 'vite-plugin-run';
import glob from 'tiny-glob';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';

async function getGenerators() {
  const generators = [];
  const generatorFiles = await glob('src/**/*.gen.mjs', { cwd: __dirname, absolute: true, dot: true, filesOnly: true });
  const envFileArgs = [];
  if (fs.existsSync('.env')) {
    envFileArgs.push('--env-file', '.env');
  }

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
            run: [process.argv[0], ...envFileArgs, '-e', `import("${generatorFileUrl}").then(a => a.main());`],
            pattern: [generatorFile, ...watchPatterns],
          },
        ],
        silent: false,
      }),
    );
  }

  return generators;
}

export default defineConfig({
  esbuild: {
    supported: {
      'top-level-await': true,
    },
  },
  plugins: [
    sveltekit(),
    ...(await getGenerators()),
    paraglide({
      project: './project.inlang',
      outdir: './src/i18n/generated',
    }),
    purgeCss(),
  ],
});
