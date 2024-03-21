import { getClockStore } from '$stores/clock-store';
import { minutesToMilliseconds, secondsToMilliseconds } from 'date-fns';
import { derived, type Readable } from 'svelte/store';
import type { ExchangerateApiResponse } from './types/exchangerate';
import { storage } from '$stores/storage';

const cacheKey = 'Widget_CryptoAssets_ExchangeRates';

let latestExchangeRateResponse: ExchangerateApiResponse = (await storage.local.get(cacheKey))[cacheKey];

export const exchangeRates = derived<Readable<Date>, ExchangerateApiResponse['rates']>(
  getClockStore(minutesToMilliseconds(1)),
  (_, set) => {
    const abort = new AbortController();
    if (
      !latestExchangeRateResponse ||
      secondsToMilliseconds(latestExchangeRateResponse.time_next_update_unix) <= Date.now()
    ) {
      fetch('https://open.er-api.com/v6/latest/USD', { signal: abort.signal })
        .then<ExchangerateApiResponse>(r => r.json())
        .then(r => {
          latestExchangeRateResponse = r;
          set(r.rates);
          return r;
        })
        .then(r => storage.local.set({ [cacheKey]: r }));
    }

    return () => {
      abort.abort();
    };
  },
  latestExchangeRateResponse?.rates,
);
