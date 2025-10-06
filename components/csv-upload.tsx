'use client';

import { useRef } from 'react';
import Papa from 'papaparse';
import { Button } from './ui/button';
import { DealRecord, Dataset } from '@/lib/types';
import { normalizeRecord } from '@/lib/utils';
import { Upload } from 'lucide-react';

interface CsvUploadProps {
  onDatasetLoaded: (dataset: Dataset) => void;
}

export function CsvUpload({ onDatasetLoaded }: CsvUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    Papa.parse<DealRecord>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim(),
      complete: (results) => {
        // Validate required columns
        const requiredColumns = ['Category', 'Offer-Sub Offer', 'Deal Stage'];
        const headers = results.meta.fields || [];
        
        const missingColumns = requiredColumns.filter(
          (col) => !headers.includes(col)
        );
        
        if (missingColumns.length > 0) {
          alert(
            `Missing required columns: ${missingColumns.join(', ')}\n\nPlease ensure your CSV has: Category, Offer-Sub Offer, Deal Stage`
          );
          return;
        }
        
        // Normalize records
        const normalizedRecords = results.data.map(normalizeRecord);
        
        const dataset: Dataset = {
          meta: {
            fileName: file.name,
            lastUpdated: new Date().toISOString(),
          },
          records: normalizedRecords,
        };
        
        onDatasetLoaded(dataset);
        
        // Reset input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        alert('Error parsing CSV file. Please check the file format.');
      },
    });
  };
  
  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        variant="outline"
        size="sm"
        className="cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <Upload className="mr-2 h-4 w-4" />
        Upload CSV
      </Button>
    </div>
  );
}