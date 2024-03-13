import fs from 'node:fs/promises';

export default { name: '[Core]: CORS bypass code', watch: ['../../.env'], outExt: '.gen.ts' };

export async function generate(outputFileHandle) {
  console.info('Started generating CORS bypass code');
  const corsBypassPattern = process.env.PRIVATE_CORS_BYPASS.replace('{origin}', '${encodeURIComponent(origin)}');
  await fs.writeFile(
    outputFileHandle,
    `export function getCorsFriendlyUrl(origin: string): string {
  return \`${corsBypassPattern}\`;
}
`,
  );
  console.info('Finished generating CORS bypass code');
}
