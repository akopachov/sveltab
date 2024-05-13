export function templateData() {
  const corsBypassPattern = process.env.VITE_CORS_BYPASS.replace('{origin}', '${encodeURIComponent(origin)}');
  return { corsBypassPattern };
}

export const template = `<%# -%>
export function getCorsFriendlyUrl(origin: string): string {
  return \`<%- corsBypassPattern %>\`;
}
`;

export default { name: '[Core]: CORS bypass code', watch: ['../../.env'], outExt: '.gen.ts' };
