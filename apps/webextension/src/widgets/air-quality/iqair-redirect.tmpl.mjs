export function templateData() {
  const redirectPattern = process.env.VITE_IQA_REDIRECT.replace('{city}', '${encodeURIComponent(city)}')
    .replace('{lat}', '${lat}')
    .replace('{lon}', '${lon}');
  return { redirectPattern };
}

export const template = `<%# -%>
export function getRedirectUrl(city: string, lat: number, lon: number): string {
  return \`<%- redirectPattern %>\`;
}
`;

export default { name: '[Air Quality Widget]: IQAir redirect', watch: ['../../.env'], outExt: '.gen.ts' };
