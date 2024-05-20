import glob from 'tiny-glob';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs/promises';
import { relative } from 'node:path';
import type { Plugin } from 'vite';
import ejs from 'ejs';
import { hashFile } from 'hasha';
import picomatch from 'picomatch';
import slash from 'slash';
import { blue, bold, green } from 'colorette';

export type TemplateData =
  | Record<string, any>
  | (() => Record<string, any> | Promise<Record<string, any>>)
  | Promise<Record<string, any>>;
export type Template = string | (() => string | Promise<string>) | Promise<string>;

const __dirname = process.cwd();

type GeneratorInfo = {
  readonly generatorFileUri: URL;
  readonly generatorFilePath: string;
  readonly generatorName: string;
  readonly outputFilePath: string;
  readonly cwd: string;
  readonly watchPatterns: string[];
  isMatchWatchPattern: (path: string) => boolean;
};

async function runGenerator(generator: GeneratorInfo) {
  const cwd = process.cwd();
  try {
    process.chdir(generator.cwd);
    console.group(blue(bold('[Generator]:')), generator.generatorName);
    const { template, templateData } = await import(generator.generatorFileUri.toString());
    const resolvedTemplateData = templateData instanceof Function ? await templateData() : await templateData;
    const resolvedTemplate = template instanceof Function ? await template() : await template;
    const renderedTemplate = await ejs.render(resolvedTemplate, resolvedTemplateData);
    await fs.writeFile(generator.outputFilePath, renderedTemplate, {
      encoding: 'utf-8',
    });
  } finally {
    process.chdir(cwd);
    console.groupEnd();
  }
}

export default async function runGeneratorsPlugin(searchPath: string): Promise<Plugin> {
  const LOADED_GENERATORS = await loadGenerators(searchPath);
  return {
    name: 'vite-plugin-run-generators',
    enforce: 'pre',
    apply: () => true,
    async configResolved() {
      for (const generator of LOADED_GENERATORS.values()) {
        await runGenerator(generator);
      }
    },
    async configureServer(server) {
      const isMatchSearchPath = picomatch(slash(searchPath));
      async function onFileChange(filePath: string) {
        filePath = slash(filePath);
        if (isMatchSearchPath(slash(relative(__dirname, filePath)))) {
          const generator = await loadGenerator(filePath);
          LOADED_GENERATORS.set(filePath, generator);
          await runGenerator(generator);
          return;
        }

        for (const generator of LOADED_GENERATORS.values()) {
          if (generator.isMatchWatchPattern(filePath)) {
            await runGenerator(generator);
          }
        }
      }

      server.watcher.on('change', onFileChange);
      server.watcher.on('add', onFileChange);
      server.watcher.on('unlink', filePath => {
        filePath = slash(filePath);
        if (LOADED_GENERATORS.has(filePath)) {
          const generator = LOADED_GENERATORS.get(filePath)!;
          fs.unlink(generator.outputFilePath);
          LOADED_GENERATORS.delete(filePath);
        }
      });
    },
  };
}

async function loadGenerators(searchPath: string) {
  const generatorFiles = Array.from(
    await glob(searchPath, {
      cwd: __dirname,
      absolute: true,
      dot: true,
      filesOnly: true,
    }),
    p => slash(p),
  );

  const generators = new Map<string, GeneratorInfo>();
  for (const generatorFile of generatorFiles) {
    generators.set(generatorFile, await loadGenerator(generatorFile));
  }

  return generators;
}

async function loadGenerator(generatorFile: string) {
  console.log(green('Loading generator'), relative(__dirname, generatorFile));
  const generatorFileUri = pathToFileURL(generatorFile);
  const hash = await hashFile(generatorFile, { algorithm: 'md5' });
  generatorFileUri.searchParams.set('v', hash);

  const { default: generator } = await import(generatorFileUri.toString());
  const generatorDir = slash(dirname(generatorFile));
  const watchPatterns = (generator.watch || []).map((p: string) => slash(resolve(generatorDir, p)));
  const outputFilePath = generatorFile.replace(/(\.(gen|g|d|t|tmpl))?\.[^/.]+$/, '') + (generator.outExt || '');
  return {
    isMatchWatchPattern: picomatch(watchPatterns),
    watchPatterns,
    outputFilePath,
    cwd: generatorDir,
    generatorFileUri: generatorFileUri,
    generatorFilePath: slash(generatorFile),
    generatorName: generator.name,
  } satisfies GeneratorInfo;
}
