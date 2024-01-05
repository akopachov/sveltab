import { PUBLIC_CORS_BYPASS } from '$env/static/public';

export function getCorsFriendlyUrl(origin: string): string {
  return PUBLIC_CORS_BYPASS.replace('{origin}', encodeURIComponent(origin));
}
