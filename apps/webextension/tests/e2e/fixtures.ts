import { expect as baseExpect } from '@playwright/test';
import type { Locator } from '@playwright/test';

export { test } from '@playwright/test';

export const expect = baseExpect.extend({
  async toImageLoaded(locator: Locator, options?: { timeout?: number }) {
    const assertionName = 'toImageLoaded';
    let pass: boolean;
    let matcherResult: any;
    try {
      await baseExpect(locator).toHaveJSProperty('complete', true, options);
      await baseExpect(locator).not.toHaveJSProperty('naturalWidth', 0, options);
      pass = true;
    } catch (e: any) {
      matcherResult = e.matcherResult;
      pass = false;
    }

    const message = pass
      ? () =>
          this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
          '\n\n' +
          `Locator: ${locator}\n` +
          `Expected: not ${this.utils.printExpected('loaded')}\n` +
          (matcherResult ? `Received: ${this.utils.printReceived(matcherResult.actual)}` : '')
      : () =>
          this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
          '\n\n' +
          `Locator: ${locator}\n` +
          `Expected: ${this.utils.printExpected('loaded')}\n` +
          (matcherResult ? `Received: ${this.utils.printReceived(matcherResult.actual)}` : '');

    return {
      message,
      pass,
      name: assertionName,
      expected: 'loaded',
      actual: matcherResult?.actual,
    };
  },
});
