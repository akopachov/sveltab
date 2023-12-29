import { dev } from '$app/environment';
import { Logger, type ILogObj } from 'tslog';

export const logger: Logger<ILogObj> = new Logger({ prefix: ['SvelTab:'], type: 'pretty', hideLogPositionForProduction: !dev, minLevel: dev ? 0 : 3});
