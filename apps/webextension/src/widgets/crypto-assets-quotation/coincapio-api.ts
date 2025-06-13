export type CoincapioResponseBase<T> = { data: T };

export type CoincapioAsset = {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  supply: string;
  maxSupply: string;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  priceUsd: string;
  changePercent24Hr: string;
  vwap24Hr: string;
};

export type CoincapioAssetResponse = CoincapioResponseBase<CoincapioAsset> & { timestamp: number };
export type CoincapioAssetsResponse = CoincapioResponseBase<CoincapioAsset[]>;

export type CoincapioAssetHistoryItem = { priceUsd: string; time: number };
export type CoincapioAssetHistoryResponse = CoincapioResponseBase<CoincapioAssetHistoryItem[]>;

export const enum CoincapioHistoryInterval {
  Daily = 'd1',
  Hourly = 'h1',
  Minutely = 'm1',
}

export function getAsset(assetId: string, apiKey: string) {
  return fetch(
    `https://rest.coincap.io/v3/assets/${assetId}?apiKey=${encodeURIComponent(apiKey)}`,
  ).then<CoincapioAssetResponse>(r => r.json());
}

export function getAssetHistory(assetId: string, interval: CoincapioHistoryInterval, apiKey: string) {
  return fetch(
    `https://rest.coincap.io/v3/assets/${assetId}/history?interval=${interval}&apiKey=${encodeURIComponent(apiKey)}`,
  ).then<CoincapioAssetHistoryResponse>(r => r.json());
}
