import glob from 'tiny-glob';
import path from 'node:path';
import fs from 'node:fs/promises';
import revisionHash from 'rev-hash';
import { minify } from '@putout/minify';
import minifyHtml from '@minify-html/node';

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
    let newHtml = fileContent.replace(scriptRegx, (m, script) => {
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

    const minifiedNewHtmlBuffer = minifyHtml.minify(Buffer.from(newHtml), {
      keep_closing_tags: true,
      keep_html_and_head_opening_tags: true,
      keep_spaces_between_attributes: true,
      keep_comments: false,
      do_not_minify_doctype: true,
      ensure_spec_compliant_unquoted_attribute_values: true,
      minify_js: false,
      minify_css: false,
    });
    newHtml = minifiedNewHtmlBuffer.toString('utf-8');

    await fs.writeFile(file, newHtml);
    console.groupEnd();
  }
  await Promise.all(scriptWritePromises);
}

removeInlineScript(process.argv[2]);
