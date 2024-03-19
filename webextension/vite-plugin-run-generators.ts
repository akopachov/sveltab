import { run } from 'vite-plugin-run';
import glob from 'tiny-glob';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
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
    const generatorDir = dirname(generatorFile);
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
              'process.chdir(process.argv[1]);Promise.all([import("node:fs/promises"),import("ejs"),import(process.argv[2]).then(g=>Promise.all([g.model(),g.view]))]).then((([f,e,g])=>Promise.all([f,e,g,f.open(process.argv[3],"w")]))).then((([f,e,g,o])=>Promise.all([o,f.writeFile(o,e.render(g[1],g[0],{}))]))).then((([o,_])=>o.close()));',
              generatorDir,
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
