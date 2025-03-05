import glob from 'tiny-glob';
import path from 'node:path';
import fs from 'node:fs/promises';
import revisionHash from 'rev-hash';
import { minify } from '@putout/minify';

async function removeInlineScript(directory) {
  console.log('Removing Inline Scripts');
  const files = await glob('**/*.{html}', {
    cwd: directory,
    dot: true,
    filesOnly: true,
  });
  const scriptWritePromises = [];
  for (const file of files.map(f => path.join(directory, f))) {
    console.group(`Extracting inline scripts from ${file}`);
    let fileContent = await fs.readFile(file, { encoding: 'utf-8' });

    const scriptRegx = /<script[^>]*>([\s\S]+?)<\/script>/gi;
    const newHtml = fileContent.replace(scriptRegx, (m, script) => {
      if (script) {
        const inlineContent = minify(
          script
            .replace('__sveltekit', 'const __sveltekit')
            .replace('document.currentScript.parentElement', 'document.body.firstElementChild'),
        );
        const hash = revisionHash(inlineContent);
        const scriptFileName = `script-${hash}.js`;
        const scriptFilePath = path.join(directory, scriptFileName);
        scriptWritePromises.push(fs.writeFile(scriptFilePath, inlineContent));
        console.log(`Inline script extracted to: ${scriptFilePath}`);
        return `<script type="module" src="/${scriptFileName}"></script>`;
      }
    });

    await fs.writeFile(file, newHtml);
    console.groupEnd();
  }
  await Promise.all(scriptWritePromises);
}

removeInlineScript(process.argv[2]);
