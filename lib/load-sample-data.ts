'use client';

import Papa from 'papaparse';
import { Dataset, DealRecord } from './types';
import { normalizeRecord } from './utils';

/**
 * Load sample CSV data from the public directory
 */
export async function loadSampleData(): Promise<Dataset | null> {
  try {
    const response = await fetch('/Deals2023_2025.csv');
    if (!response.ok) return null;
    
    const csvText = await response.text();
    
    return new Promise((resolve) => {
      Papa.parse<DealRecord>(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        transform: (value) => value.trim(),
        complete: (results) => {
          // Normalize records
          const normalizedRecords = results.data.map(normalizeRecord);
          
          const dataset: Dataset = {
            meta: {
              fileName: 'Deals2023_2025.csv (pre-loaded)',
              lastUpdated: new Date().toISOString(),
            },
            records: normalizedRecords,
          };
          resolve(dataset);
        },
        error: () => {
          resolve(null);
        },
      });
    });
  } catch (error) {
    console.error('Error loading sample data:', error);
    return null;
  }
}