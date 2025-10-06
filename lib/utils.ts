import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { DealRecord } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalize deal records by cleaning up category and offer fields
 */
export function normalizeRecord(record: DealRecord): DealRecord {
  // Normalize category: remove subcategory suffixes (e.g., " - Luxury")
  const normalizedCategory = record.Category?.split(' - ')[0].trim() || record.Category;
  
  // Normalize offer: take only the first/primary offer and remove prefixes
  let normalizedOffer = record['Offer-Sub Offer'];
  if (normalizedOffer) {
    // Split by semicolon and take only the first offer
    const firstOffer = normalizedOffer.split(';')[0].trim();
    // Remove prefixes like "Offer - ", "Solving - ", "Learning - ", "Services - "
    const match = firstOffer.match(/^(?:Offer|Solving|Learning|Services)\s*-\s*(.+)$/i);
    normalizedOffer = match ? match[1].trim() : firstOffer;
  }
  
  return {
    ...record,
    Category: normalizedCategory,
    'Offer-Sub Offer': normalizedOffer,
  };
}
