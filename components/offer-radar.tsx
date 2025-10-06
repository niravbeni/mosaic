'use client';

import { ResponsiveRadar } from '@nivo/radar';
import { OfferMetrics } from '@/lib/types';

interface OfferRadarProps {
  data: OfferMetrics[];
  onOfferClick?: (offer: string) => void;
}

// Format label to be shorter or wrapped
const formatLabel = (label: string): string => {
  // If label is short enough, return as-is
  if (label.length <= 20) return label;
  
  // Split by slashes and spaces
  const parts = label.split(/\s*\/\s*/);
  
  // If we have multiple parts, abbreviate
  if (parts.length > 2) {
    return parts.map((part, idx) => {
      // Keep first and last parts fuller
      if (idx === 0 || idx === parts.length - 1) {
        return part.length > 15 ? part.substring(0, 12) + '...' : part;
      }
      // Abbreviate middle parts
      return part.split(' ').map(w => w[0]).join('');
    }).join(' / ');
  }
  
  // Otherwise truncate with ellipsis
  return label.substring(0, 20) + '...';
};

export function OfferRadar({ data, onOfferClick }: OfferRadarProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] sm:h-[400px] md:h-[532px] flex items-center justify-center text-muted-foreground">
        Select a category to view offers
      </div>
    );
  }
  
  // Transform data for Nivo radar format with formatted labels
  const radarData = data
    .filter((item) => item.offer && item.strengthIndex != null)
    .map((item) => ({
      offer: formatLabel(item.offer),
      originalOffer: item.offer, // Keep original for tooltip
      strength: Math.round(item.strengthIndex),
    }));
  
  return (
    <div className="h-[300px] sm:h-[400px] md:h-[512px] w-full">
      <ResponsiveRadar
        data={radarData}
        keys={['strength']}
        indexBy="offer"
        maxValue={100}
        margin={{ top: 50, right: 70, bottom: 50, left: 70 }}
        curve="linearClosed"
        borderWidth={2}
        borderColor={{ from: 'color' }}
        gridLevels={5}
        gridShape="circular"
        gridLabelOffset={12}
        enableDots={true}
        dotSize={6}
        dotColor={{ theme: 'background' }}
        dotBorderWidth={2}
        dotBorderColor={{ from: 'color' }}
        enableDotLabel={false}
        colors={['#F87700', '#FFA040', '#FFB366', '#FFC68C', '#FFD9B2']}
        fillOpacity={0.25}
        blendMode="multiply"
        animate={true}
        motionConfig="gentle"
        isInteractive={true}
        onClick={(point: any) => {
          if (onOfferClick && point.index) {
            onOfferClick(point.index as string);
          }
        }}
        theme={{
          text: {
            fontSize: 9,
          },
          tooltip: {
            container: {
              background: 'white',
              color: 'black',
              fontSize: 11,
              borderRadius: 4,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              padding: '6px 10px',
            },
          },
        }}
      />
    </div>
  );
}

