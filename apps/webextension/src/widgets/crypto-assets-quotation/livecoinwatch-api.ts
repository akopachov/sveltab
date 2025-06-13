export type CryptoAssetResponse = {
  rate: number;
  volume: number;
  cap: number;
  liquidity: number;
  delta: {
    hour: number;
    day: number;
    week: number;
    month: number;
    quarter: number;
    year: number;
  };
};

export type CryptoAssetInfo = {
  name: string;
  notname: string;
  code: string;
  notcode: string;
  type: 'coin' | 'token';
  rank: number;
  symbol?: string;
};

export type CryptoAssetsResponse = {
  success: boolean;
  data: CryptoAssetInfo[];
};

export type CryptoAssetHistoryItem = {
  date: number;
  rate: number;
  volume: number;
  cap: number;
  liquidity: number;
};

export type CryptoAssetHistoryResponse = {
  history: CryptoAssetHistoryItem[];
};

export function getAsset(assetId: string, apiKey: string) {
  return fetch('https://api.livecoinwatch.com/coins/single', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      currency: 'USD',
      code: assetId,
      meta: false,
    }),
  }).then<CryptoAssetResponse>(r => (r.ok ? r.json() : Promise.reject(r)));
}

export async function getAssetHistory(assetId: string, apiKey: string, rangeStart: number) {
  const rangeEnd = Date.now();
  return fetch('https://api.livecoinwatch.com/coins/single/history', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      currency: 'USD',
      code: assetId,
      meta: false,
      start: rangeStart,
      end: rangeEnd,
    }),
  }).then<CryptoAssetHistoryResponse>(r => (r.ok ? r.json() : Promise.reject(r)));
}
