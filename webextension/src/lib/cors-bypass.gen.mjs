import fs from 'node:fs';
import path from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export default { name: '[Core]: CORS bypass code', pattern: ['../../.env'] };

export async function main() {
  const scriptDir = dirname(fileURLToPath(import.meta.url));

  console.info('Started generating CORS bypass code');
  const corsBypassPattern = process.env.PRIVATE_CORS_BYPASS.replace('{origin}', '${encodeURIComponent(origin)}');
  fs.writeFileSync(
    path.join(scriptDir, 'cors-bypass.ts'),
    `export function getCorsFriendlyUrl(origin: string): string {
  return \`${corsBypassPattern}\`;
}
`,
  );
  console.info('Finished generating CORS bypass code');
}
