'use client';

import { useState, useEffect } from 'react';
import { compress, decompress } from 'lz-string';
import { Dataset } from './types';

const STORAGE_KEY = 'ideo-strengths-dataset';

/**
 * Save dataset to localStorage with optional compression
 */
export function saveDataset(dataset: Dataset): void {
  try {
    const json = JSON.stringify(dataset);
    const compressed = compress(json);
    localStorage.setItem(STORAGE_KEY, compressed);
  } catch (error) {
    console.error('Error saving dataset to localStorage:', error);
  }
}

/**
 * Load dataset from localStorage
 */
export function loadDataset(): Dataset | null {
  try {
    const compressed = localStorage.getItem(STORAGE_KEY);
    if (!compressed) return null;
    
    const json = decompress(compressed);
    if (!json) return null;
    
    return JSON.parse(json) as Dataset;
  } catch (error) {
    console.error('Error loading dataset from localStorage:', error);
    return null;
  }
}

/**
 * Clear dataset from localStorage
 */
export function clearDataset(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing dataset from localStorage:', error);
  }
}

/**
 * Hook to manage dataset in localStorage
 */
export function useDataset() {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load dataset on mount
  useEffect(() => {
    const loaded = loadDataset();
    setDataset(loaded);
    setIsLoading(false);
  }, []);
  
  // Save dataset whenever it changes
  useEffect(() => {
    if (dataset && !isLoading) {
      saveDataset(dataset);
    }
  }, [dataset, isLoading]);
  
  const updateDataset = (newDataset: Dataset | null) => {
    setDataset(newDataset);
    if (newDataset) {
      saveDataset(newDataset);
    } else {
      clearDataset();
    }
  };
  
  return {
    dataset,
    setDataset: updateDataset,
    isLoading,
  };
}