import { DealRecord, StrengthMetrics } from './types';

// Configurable weights for the strength index calculation
export const STRENGTH_WEIGHTS = {
  signRate: 0.5,
  deliveryRate: 0.5,
};

// Deal stage mappings
export enum DealStageBucket {
  WON = 'won',
  SIGNED = 'signed',
  NOT_SUCCESSFUL = 'not_successful',
}

/**
 * Maps a deal stage to a bucket
 */
export function mapDealStage(stage: string): DealStageBucket | null {
  const normalized = stage.toLowerCase().trim();
  
  // Won/Delivered deals - successfully completed
  if (normalized.includes('won') || normalized === 'closed won' || normalized === 'delivered') {
    return DealStageBucket.WON;
  }
  
  // Signed/In-progress deals - signed, verbal agreement, qualified, in proposal, etc.
  if (
    normalized === 'signed' ||
    normalized.includes('qualified') || 
    normalized.includes('prospecting') ||
    normalized === 'qualifying' ||
    normalized === 'verbal' ||
    normalized.includes('proposal')
  ) {
    return DealStageBucket.SIGNED;
  }
  
  // Not successful - cancelled or lost
  if (normalized.includes('cancelled') || normalized.includes('lost')) {
    return DealStageBucket.NOT_SUCCESSFUL;
  }
  
  return null;
}

/**
 * Calculate strength metrics for a set of deals
 */
export function calculateStrengthMetrics(deals: DealRecord[]): StrengthMetrics {
  let wonDeals = 0;
  let signedDeals = 0;
  let totalDeals = deals.length;
  
  deals.forEach((deal) => {
    const bucket = mapDealStage(deal['Deal Stage']);
    
    if (bucket === DealStageBucket.WON) {
      wonDeals++;
      signedDeals++; // Won deals are also signed
    } else if (bucket === DealStageBucket.SIGNED) {
      signedDeals++;
    }
  });
  
  // Calculate rates
  const signRate = totalDeals > 0 ? signedDeals / totalDeals : 0;
  const deliveryRate = signedDeals > 0 ? wonDeals / signedDeals : 0;
  
  // Calculate strength index
  const strengthIndex =
    100 *
    (STRENGTH_WEIGHTS.signRate * signRate +
      STRENGTH_WEIGHTS.deliveryRate * deliveryRate);
  
  return {
    totalDeals,
    wonDeals,
    signedDeals,
    signRate,
    deliveryRate,
    strengthIndex,
  };
}

/**
 * Calculate strength metrics grouped by a key
 */
export function calculateGroupedMetrics<T extends { [key: string]: any }>(
  deals: DealRecord[],
  groupKey: keyof DealRecord,
  additionalFields?: (group: string) => Partial<T>
): T[] {
  const groups = new Map<string, DealRecord[]>();
  
  deals.forEach((deal) => {
    const groupValue = deal[groupKey];
    if (!groupValue) return;
    
    if (!groups.has(groupValue)) {
      groups.set(groupValue, []);
    }
    groups.get(groupValue)!.push(deal);
  });
  
  return Array.from(groups.entries()).map(([group, groupDeals]) => {
    const metrics = calculateStrengthMetrics(groupDeals);
    const additional = additionalFields ? additionalFields(group) : {};
    
    return {
      ...metrics,
      ...additional,
    } as unknown as T;
  });
}