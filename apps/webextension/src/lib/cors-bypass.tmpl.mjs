export function templateData() {
  const corsBypassPattern = process.env.VITE_CORS_BYPASS.replace('{origin}', '${encodeURIComponent(origin)}');
  return { corsBypassPattern };
}

export const template = `<%# -%>
function getCorsFriendlyUrlUsingDefaultProvider(origin: string): string {
  return \`<%- corsBypassPattern %>\`;
}

let currentCorsProvider: string | null = null

export function setCorsProvider(providerUrl: string | null | undefined): void {
  if (providerUrl && URL.canParse(providerUrl)) {
    currentCorsProvider = providerUrl;
  } else {
    currentCorsProvider = null;
  }
}

export function getCorsFriendlyUrl(origin: string): string {
  if (currentCorsProvider) {
    return currentCorsProvider.replace('{origin}', encodeURIComponent(origin));
  }

  return getCorsFriendlyUrlUsingDefaultProvider(origin);
}
`;

export default { name: '[Core]: CORS bypass code', watch: ['../../.env'], outExt: '.gen.ts' };
