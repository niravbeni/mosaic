export interface DealRecord {
  Category: string;
  "Offer-Sub Offer": string;
  "Deal Stage": string;
  [key: string]: string; // Allow other columns
}

export interface DatasetMeta {
  fileName: string;
  lastUpdated: string;
}

export interface Dataset {
  meta: DatasetMeta;
  records: DealRecord[];
}

export interface StrengthMetrics {
  totalDeals: number;
  wonDeals: number;
  signedDeals: number;
  signRate: number;
  deliveryRate: number;
  strengthIndex: number;
}

export interface CategoryMetrics extends StrengthMetrics {
  category: string;
}

export interface OfferMetrics extends StrengthMetrics {
  offer: string;
}

export interface CategoryOfferMetrics extends StrengthMetrics {
  category: string;
  offer: string;
}