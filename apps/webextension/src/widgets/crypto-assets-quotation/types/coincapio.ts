export type CoincapioResponseBase<T> = { data: T };

export type CoincapioAsset = {
  id: string;
  rank: number;
  symbol: string;
  name: string;
  supply: number;
  maxSupply: number;
  marketCapUsd: number;
  volumeUsd24Hr: number;
  priceUsd: number;
  changePercent24Hr: number;
  vwap24Hr: number;
};

export type CoincapioAssetResponse = CoincapioResponseBase<CoincapioAsset> & { timestamp: number };
export type CoincapioAssetsResponse = CoincapioResponseBase<CoincapioAsset[]>;

export type CoincapioAssetHistoryItem = { priceUsd: number; time: number };
export type CoincapioAssetHistoryResponse = CoincapioResponseBase<CoincapioAssetHistoryItem[]>;
