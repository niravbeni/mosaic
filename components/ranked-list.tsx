'use client';

import { Card, CardContent } from './ui/card';
import { StrengthMetrics } from '@/lib/types';

interface RankedListProps<T extends StrengthMetrics & { [key: string]: any }> {
  data: T[];
  nameKey: string;
  onItemClick?: (item: T) => void;
  selectedItem?: string | null;
}

export function RankedList<T extends StrengthMetrics & { [key: string]: any }>({
  data,
  nameKey,
  onItemClick,
  selectedItem,
}: RankedListProps<T>) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No data available
      </div>
    );
  }
  
  // Sort by strength index descending
  const sortedData = [...data]
    .filter((item) => item[nameKey] && item.strengthIndex != null)
    .sort((a, b) => b.strengthIndex - a.strengthIndex);
  
  return (
    <div className="relative h-[400px] sm:h-[480px] md:h-[532px]">
      <div className="space-y-1.5 sm:space-y-2 h-full overflow-y-auto pb-4 scrollbar-always-visible">
        {sortedData.map((item, index) => {
        const itemName = item[nameKey];
        const isSelected = selectedItem === itemName;
        
        return (
          <Card
            key={itemName}
            className={`transition-all border-2 ${
              isSelected ? 'border-[#F87700] shadow-lg bg-[#F87700]/5' : 'border-border'
            } ${onItemClick ? 'cursor-pointer hover:bg-[#F87700]/10 hover:border-[#FFA040] hover:shadow-md' : ''}`}
            onClick={() => onItemClick?.(item)}
          >
            <CardContent className="p-2 sm:p-3 md:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="text-lg sm:text-xl md:text-2xl font-bold text-muted-foreground w-6 sm:w-8 flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm sm:text-base truncate">{itemName}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {item.totalDeals} deals
                    </p>
                  </div>
                </div>
                
                <div className="text-right flex-shrink-0">
                  <p className="text-lg sm:text-xl md:text-2xl font-bold">
                    {Math.round(item.strengthIndex)}
                  </p>
                  <div className="text-[10px] sm:text-xs text-muted-foreground space-y-0.5">
                    <p>Sign: {Math.round(item.signRate * 100)}%</p>
                    <p>Deliver: {Math.round(item.deliveryRate * 100)}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      </div>
      {/* Scroll indicator gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card via-card/70 to-transparent pointer-events-none" />
    </div>
  );
}

