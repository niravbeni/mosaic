'use client';

import { ResponsiveRadar } from '@nivo/radar';
import { CategoryMetrics } from '@/lib/types';

interface CategoryRadarProps {
  data: CategoryMetrics[];
  onCategoryClick?: (category: string) => void;
  selectedCategory?: string | null;
}

export function CategoryRadar({ data, onCategoryClick, selectedCategory }: CategoryRadarProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[532px] flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }
  
  // Transform data for Nivo radar format
  const radarData = data
    .filter((item) => item.category && item.strengthIndex != null)
    .map((item) => ({
      category: item.category,
      strength: Math.round(item.strengthIndex),
    }));
  
  return (
    <div className="h-[532px]">
      <ResponsiveRadar
        data={radarData}
        keys={['strength']}
        indexBy="category"
        maxValue={100}
        margin={{ top: 70, right: 140, bottom: 70, left: 140 }}
        curve="linearClosed"
        borderWidth={2}
        borderColor={{ from: 'color' }}
        gridLevels={5}
        gridShape="circular"
        gridLabelOffset={16}
        enableDots={true}
        dotSize={8}
        dotColor={{ theme: 'background' }}
        dotBorderWidth={2}
        dotBorderColor={{ from: 'color' }}
        enableDotLabel={false}
        colors={['#F87700', '#FFA040', '#FFB366', '#FFC68C']}
        fillOpacity={0.25}
        blendMode="multiply"
        animate={true}
        motionConfig="gentle"
        isInteractive={true}
        onClick={(point: any) => {
          if (onCategoryClick && point.index) {
            onCategoryClick(point.index as string);
          }
        }}
        theme={{
          text: {
            fontSize: 12,
          },
          tooltip: {
            container: {
              background: 'white',
              color: 'black',
              fontSize: 12,
              borderRadius: 4,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              padding: '8px 12px',
            },
          },
        }}
      />
    </div>
  );
}

