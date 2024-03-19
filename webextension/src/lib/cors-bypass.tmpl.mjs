export default { name: '[Core]: CORS bypass code', watch: ['../../.env'], outExt: '.gen.ts' };

export function model() {
  console.info('Started generating CORS bypass code');
  const corsBypassPattern = process.env.PRIVATE_CORS_BYPASS.replace('{origin}', '${encodeURIComponent(origin)}');
  console.info('Finished generating CORS bypass code');
  return { corsBypassPattern };
}

export const view = `<%# -%>
export function getCorsFriendlyUrl(origin: string): string {
  return \`<%= corsBypassPattern %>\`;
}
`;
