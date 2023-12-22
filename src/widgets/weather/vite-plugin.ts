import path from 'node:path';
import { run } from 'vite-plugin-run';

export function weatherWidgetVitePlugin() {
  return run({
    input: [
      {
        name: 'Widget[Weather]: Generate asset packs',
        run: [process.argv[0], path.resolve(__dirname, 'asset-packs/generator.mjs'), 'run'],
        pattern: [path.resolve(__dirname, 'asset-packs/*.json')],
      },
    ],
    silent: false,
  });
}
