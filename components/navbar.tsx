'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { CsvUpload } from './csv-upload';
import { Dataset } from '@/lib/types';

interface NavbarProps {
  onDatasetLoaded?: (dataset: Dataset) => void;
}

export function Navbar({ onDatasetLoaded }: NavbarProps) {
  const pathname = usePathname();
  
  return (
    <header className="border-b">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">IDEO Mosaic</h1>
          
          <nav className="flex items-center gap-2">
            <Link href="/strengths">
              <Button
                variant="outline"
                size="sm"
                className={`cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  pathname === '/strengths' ? 'bg-gray-100 dark:bg-gray-800' : ''
                }`}
              >
                IDEO Strengths
              </Button>
            </Link>
            
            <Link href="/clients">
              <Button
                variant="outline"
                size="sm"
                className={`cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  pathname === '/clients' ? 'bg-gray-100 dark:bg-gray-800' : ''
                }`}
              >
                Clients
              </Button>
            </Link>
          </nav>
        </div>
        
        {onDatasetLoaded && <CsvUpload onDatasetLoaded={onDatasetLoaded} />}
      </div>
    </header>
  );
}