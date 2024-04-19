// removeInlineScript.cjs
import glob from 'tiny-glob';
import path from 'node:path';
import fs from 'node:fs';
import { hashSync } from 'hasha';

async function removeInlineScript(directory) {
  console.log('Removing Inline Scripts');
  const files = await glob('**/*.{html}', {
    cwd: directory,
    dot: true,
    aboslute: true,
    filesOnly: true,
  });
  files
    .map(f => path.join(directory, f))
    .forEach(file => {
      console.log(`edit file: ${file}`);
      let f = fs.readFileSync(file, { encoding: 'utf-8' });

      const scriptRegx = /<script[^>]*>([\s\S]+?)<\/script>/gi;
      const newHtml = f.replace(scriptRegx, (m, script) => {
        if (script) {
          const inlineContent = script
            .replace('__sveltekit', 'const __sveltekit')
            .replace('document.currentScript.parentElement', 'document.body.firstElementChild');
          const hash = hashSync(inlineContent, { encoding: 'base64', algorithm: 'md5' }).replace(/\W/gi, '');
          const fn = `/script-${hash}.js`;
          fs.writeFileSync(`${directory}${fn}`, inlineContent);
          console.log(`Inline script extracted and saved at: ${directory}${fn}`);
          return `<script type="module" src="${fn}"></script>`;
        }
      });

      fs.writeFileSync(file, newHtml);
    });
}

removeInlineScript(process.argv[2]);
