export function templateData() {
  const redirectPattern = process.env.VITE_OWM_REDIRECT.replace('{city}', '${encodeURIComponent(city)}')
    .replace('{country}', '${encodeURIComponent(country)}')
    .replace('{lat}', '${lat}')
    .replace('{lon}', '${lon}');
  return { redirectPattern };
}

export const template = `<%# -%>
export function getRedirectUrl(city: string, country: string, lat: number, lon: number): string {
  return \`<%- redirectPattern %>\`;
}
`;

export default { name: '[Weather Widget]: OpenWeatherMap redirect', watch: ['../../.env'], outExt: '.gen.ts' };
