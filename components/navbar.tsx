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
      <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 py-3 sm:py-4 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl font-bold whitespace-nowrap">
            <span className="text-[#F87700]">IDEO</span> Mosaic
          </h1>
          
          <nav className="flex items-center gap-2 flex-wrap">
            <Link href="/strengths">
              <Button
                variant={pathname === '/strengths' ? 'default' : 'outline'}
                size="sm"
              >
                IDEO Strengths
              </Button>
            </Link>
            
            <Link href="/clients">
              <Button
                variant={pathname === '/clients' ? 'default' : 'outline'}
                size="sm"
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