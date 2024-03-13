import { run } from 'vite-plugin-run';
import glob from 'tiny-glob';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';
import type { Plugin } from 'vite';

export async function runGenerators(params: { searchPath: string }) {
  const generators: Plugin<any>[] = [];
  const generatorFiles = await glob(params.searchPath, { cwd: __dirname, absolute: true, dot: true, filesOnly: true });
  const envFileArgs: string[] = [];
  if (existsSync('.env')) {
    envFileArgs.push('--env-file', '.env');
  }

  if (existsSync(`.env.${process.env.NODE_ENV}`)) {
    envFileArgs.push('--env-file', `.env.${process.env.NODE_ENV}`);
  }

  for (const generatorFile of generatorFiles) {
    console.log(`Loading generator from ${generatorFile}`);
    const generatorFileUrl = pathToFileURL(generatorFile).toString();
    const generator = await import(generatorFileUrl).then(m => m.default);
    const generatorDir = dirname(fileURLToPath(generatorFileUrl));
    const watchPatterns = (generator.watch || []).map((p: string) => resolve(generatorDir, p));
    const outputFilePath = generatorFile.replace(/(\.(gen|g|d|t|tmpl))?\.[^/.]+$/, '') + (generator.outExt || '');
    generators.push(
      run({
        input: [
          {
            name: generator.name,
            run: [
              process.argv[0],
              ...envFileArgs,
              '-e',
              'Promise.all([import("node:fs/promises"), import(process.argv[1]).then(a => a.generate)]).then(([fs, generate]) => Promise.all([generate, fs.open(process.argv[2], "w")])).then(([generate, outFile]) => Promise.all([outFile, generate(outFile)])).then(([outFile, _]) => outFile.close());',
              generatorFileUrl,
              outputFilePath,
            ],
            pattern: [generatorFile, ...watchPatterns],
          },
        ],
        silent: false,
      }),
    );
  }

  return generators;
}
