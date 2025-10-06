'use client';

import { ResponsiveHeatMap } from '@nivo/heatmap';
import { CategoryOfferMetrics } from '@/lib/types';

interface StrengthHeatmapProps {
  data: CategoryOfferMetrics[];
}

export function StrengthHeatmap({ data }: StrengthHeatmapProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full min-h-[400px] flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }
  
  // Get all unique categories and offers
  const categories = Array.from(new Set(data.map((d) => d.category).filter(Boolean)));
  const offers = Array.from(new Set(data.map((d) => d.offer).filter(Boolean)));
  
  // Additional guard: ensure we have both categories and offers
  if (categories.length === 0 || offers.length === 0) {
    return (
      <div className="h-full min-h-[400px] flex items-center justify-center text-muted-foreground">
        Insufficient data for heatmap
      </div>
    );
  }
  
  // Transform data for Nivo heatmap format
  const heatmapData = categories.map((category) => ({
    id: category,
    data: offers.map((offer) => {
      const item = data.find(
        (d) => d.category === category && d.offer === offer
      );
      return {
        x: offer,
        y: item ? Math.round(item.strengthIndex) : 0,
      };
    }),
  }));
  
  return (
    <div className="h-full min-h-[400px] md:min-h-[600px] lg:min-h-[400px]">
      <ResponsiveHeatMap
        data={heatmapData}
        margin={{ top: 160, right: 60, bottom: 54, left: 140 }}
        valueFormat=">-.0f"
        axisTop={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
        }}
        colors={{
          type: 'sequential',
          scheme: 'blues',
          minValue: 0,
          maxValue: 100,
        }}
        emptyColor="#e0e0e0"
        labelTextColor={{ from: 'color', modifiers: [['darker', 1.8]] }}
        animate={true}
        hoverTarget="cell"
        borderColor="#ffffff"
        legends={[
          {
            anchor: 'bottom',
            translateX: 0,
            translateY: 40,
            length: 400,
            thickness: 8,
            direction: 'row',
            title: 'Strength Index →',
          },
        ]}
        theme={{
          text: {
            fontSize: 11,
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
