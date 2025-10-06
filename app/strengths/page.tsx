'use client';

import { useState, useMemo, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { CategoryRadar } from '@/components/category-radar';
import { OfferRadar } from '@/components/offer-radar';
import { RankedList } from '@/components/ranked-list';
import { StrengthHeatmap } from '@/components/strength-heatmap';
import { AIAnalysisProvider } from '@/components/ai-analysis-manager';
import { AISlideCombined } from '@/components/ai-slide-combined';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDataset } from '@/lib/storage';
import { calculateGroupedMetrics } from '@/lib/strength-calculator';
import { CategoryMetrics, OfferMetrics, CategoryOfferMetrics, Dataset } from '@/lib/types';
import { loadSampleData } from '@/lib/load-sample-data';
import { Upload } from 'lucide-react';
import type { CarouselApi } from '@/components/ui/carousel';

export default function StrengthsPage() {
  const { dataset, setDataset, isLoading } = useDataset();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  
  const totalSlides = 4; // 3 data slides + 1 combined AI slide
  
  // Load sample data if no dataset exists
  useEffect(() => {
    if (!isLoading && !dataset) {
      setIsLoadingSample(true);
      loadSampleData().then((sampleData) => {
        if (sampleData) {
          setDataset(sampleData);
        }
        setIsLoadingSample(false);
      });
    }
  }, [isLoading, dataset, setDataset]);
  
  // Calculate category metrics
  const categoryMetrics = useMemo<CategoryMetrics[]>(() => {
    if (!dataset) return [];
    
    return calculateGroupedMetrics<CategoryMetrics>(
      dataset.records,
      'Category',
      (category) => ({ category })
    );
  }, [dataset]);
  
  // Auto-select first category when data loads
  useEffect(() => {
    if (categoryMetrics.length > 0 && !selectedCategory) {
      setSelectedCategory(categoryMetrics[0].category);
    }
  }, [categoryMetrics, selectedCategory]);
  
  // Update current slide when carousel changes
  useEffect(() => {
    if (!carouselApi) return;
    
    const onSelect = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };
    
    carouselApi.on('select', onSelect);
    return () => {
      carouselApi.off('select', onSelect);
    };
  }, [carouselApi]);
  
  // Add trackpad horizontal scroll support with slide-by-slide navigation
  useEffect(() => {
    if (!carouselApi) return;
    
    let accumulatedDelta = 0;
    let isLocked = false;
    let gestureEndTimeout: NodeJS.Timeout | null = null;
    const SCROLL_THRESHOLD = 40;
    const GESTURE_END_DELAY = 150; // Detect when gesture ends
    
    const handleWheel = (e: WheelEvent) => {
      // If scrolling horizontally with trackpad
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        
        // If we already triggered a slide change, ignore all further input until gesture ends
        if (isLocked) {
          // Still detect gesture end even when locked
          if (gestureEndTimeout) clearTimeout(gestureEndTimeout);
          gestureEndTimeout = setTimeout(() => {
            isLocked = false;
            accumulatedDelta = 0;
          }, GESTURE_END_DELAY);
          return;
        }
        
        accumulatedDelta += e.deltaX;
        
        // Trigger slide change when threshold reached
        if (Math.abs(accumulatedDelta) >= SCROLL_THRESHOLD) {
          if (accumulatedDelta > 0 && carouselApi.canScrollNext()) {
            carouselApi.scrollNext();
            isLocked = true; // Lock immediately
            accumulatedDelta = 0;
          } else if (accumulatedDelta < 0 && carouselApi.canScrollPrev()) {
            carouselApi.scrollPrev();
            isLocked = true; // Lock immediately
            accumulatedDelta = 0;
          } else {
            accumulatedDelta = 0;
          }
        }
        
        // Detect end of gesture (no scroll events for GESTURE_END_DELAY ms)
        if (gestureEndTimeout) clearTimeout(gestureEndTimeout);
        gestureEndTimeout = setTimeout(() => {
          isLocked = false;
          accumulatedDelta = 0;
        }, GESTURE_END_DELAY);
      }
    };
    
    const container = carouselApi.containerNode();
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (gestureEndTimeout) clearTimeout(gestureEndTimeout);
    };
  }, [carouselApi]);
  
  // Calculate offer metrics for selected category
  const offerMetrics = useMemo<OfferMetrics[]>(() => {
    if (!dataset || !selectedCategory) return [];
    
    const categoryDeals = dataset.records.filter(
      (deal) => deal.Category === selectedCategory
    );
    
    return calculateGroupedMetrics<OfferMetrics>(
      categoryDeals,
      'Offer-Sub Offer',
      (offer) => ({ offer })
    );
  }, [dataset, selectedCategory]);
  
  // Calculate heatmap data (category × offer)
  const heatmapData = useMemo<CategoryOfferMetrics[]>(() => {
    if (!dataset) return [];
    
    const data: CategoryOfferMetrics[] = [];
    
    // Group by category and offer
    const grouped = new Map<string, Map<string, CategoryOfferMetrics>>();
    
    categoryMetrics.forEach((catMetric) => {
      const category = catMetric.category;
      const categoryDeals = dataset.records.filter(
        (deal) => deal.Category === category
      );
      
      const offers = calculateGroupedMetrics<OfferMetrics>(
        categoryDeals,
        'Offer-Sub Offer',
        (offer) => ({ offer })
      );
      
      offers.forEach((offerMetric) => {
        data.push({
          category,
          ...offerMetric,
        });
      });
    });
    
    return data;
  }, [dataset, categoryMetrics]);
  
  const handleDatasetLoaded = (newDataset: Dataset) => {
    setDataset(newDataset);
    setSelectedCategory(null);
  };
  
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    // Scroll to next slide (slide 2) to see the offers
    if (carouselApi) {
      carouselApi.scrollTo(1);
    }
  };
  
  if (isLoading || isLoadingSample) {
    return (
      <div className="min-h-screen">
        <Navbar onDatasetLoaded={handleDatasetLoaded} />
        <main className="container mx-auto py-8 px-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    );
  }
  
  if (!dataset) {
    return (
      <div className="min-h-screen">
        <Navbar onDatasetLoaded={handleDatasetLoaded} />
        <main className="container mx-auto py-8 px-6">
          <Card>
            <CardHeader>
              <CardTitle>IDEO Strengths</CardTitle>
              <CardDescription>
                Visualize strengths by sector and offer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Upload className="h-4 w-4" />
                <AlertTitle>No Data Loaded</AlertTitle>
                <AlertDescription>
                  Please upload a CSV file to begin analyzing IDEO's strengths.
                  Your CSV should include these columns: Category, Offer-Sub Offer, Deal Stage.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }
  
  return (
    <AIAnalysisProvider dataset={dataset}>
      <div className="h-screen flex flex-col overflow-hidden">
        <Navbar onDatasetLoaded={handleDatasetLoaded} />
      
      {/* Dataset info header */}
      <div className="border-b bg-background px-6 py-3">
        <div className="container mx-auto">
          <div className="text-sm text-muted-foreground">
            <p>
              <strong>Dataset:</strong> {dataset.meta.fileName} •{' '}
              <strong>Records:</strong> {dataset.records.length} •{' '}
              <strong>Last Updated:</strong>{' '}
              {new Date(dataset.meta.lastUpdated).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
      
      {/* Slide navigation */}
      <div className="border-b bg-muted/30 px-6 py-2">
        <div className="container mx-auto">
          <div className="flex gap-2 items-center justify-center flex-wrap">
            <Button
              variant={currentSlide === 0 ? 'default' : 'ghost'}
              size="sm"
              onClick={() => carouselApi?.scrollTo(0)}
              className="text-xs"
            >
              Categories
            </Button>
            <Button
              variant={currentSlide === 1 ? 'default' : 'ghost'}
              size="sm"
              onClick={() => carouselApi?.scrollTo(1)}
              className="text-xs"
            >
              Offers
            </Button>
            <Button
              variant={currentSlide === 2 ? 'default' : 'ghost'}
              size="sm"
              onClick={() => carouselApi?.scrollTo(2)}
              className="text-xs"
            >
              Heatmap
            </Button>
            <Button
              variant={currentSlide === 3 ? 'default' : 'ghost'}
              size="sm"
              onClick={() => carouselApi?.scrollTo(3)}
              className="text-xs"
            >
              AI Analysis
            </Button>
          </div>
        </div>
      </div>
      
      {/* Carousel container */}
      <main className="flex-1 overflow-hidden relative">
        <Carousel 
          className="h-full w-full"
          setApi={setCarouselApi}
          opts={{
            align: 'start',
            loop: false,
            watchDrag: true,
            dragFree: false,
          }}
        >
          <CarouselContent className="h-full">
            {/* Slide 1: Category Strengths + Category Rankings */}
            <CarouselItem className="h-full">
              <div className="h-full px-6 py-6">
                <div className="container mx-auto h-full">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                    <Card className="lg:col-span-2 flex flex-col">
                      <CardHeader>
                        <CardTitle>Category Strengths</CardTitle>
                        <CardDescription>
                          Overall IDEO strengths by category
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <CategoryRadar
                          data={categoryMetrics}
                          onCategoryClick={handleCategoryClick}
                          selectedCategory={selectedCategory}
                        />
                      </CardContent>
                    </Card>
                    
                    <Card className="flex flex-col">
                      <CardHeader>
                        <CardTitle>Category Rankings</CardTitle>
                        <CardDescription>
                          Ranked by strength index
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 overflow-hidden">
                        <RankedList
                          data={categoryMetrics}
                          nameKey="category"
                          onItemClick={(item) => handleCategoryClick(item.category)}
                          selectedItem={selectedCategory}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CarouselItem>
            
            {/* Slide 2: Offers + Offer Rankings */}
            <CarouselItem className="h-full">
              <div className="h-full px-6 py-6">
                <div className="container mx-auto h-full">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                    <Card className="lg:col-span-2 flex flex-col">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-nowrap">Offers in</CardTitle>
                          <Select value={selectedCategory || undefined} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-[240px]">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categoryMetrics.map((cat) => (
                                <SelectItem key={cat.category} value={cat.category}>
                                  {cat.category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <CardDescription>
                          Strength breakdown by offer
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <OfferRadar
                          data={offerMetrics}
                        />
                      </CardContent>
                    </Card>
                    
                    <Card className="flex flex-col">
                      <CardHeader>
                        <CardTitle>Offer Rankings</CardTitle>
                        <CardDescription>
                          Ranked by strength index
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 overflow-hidden">
                        <RankedList
                          data={offerMetrics}
                          nameKey="offer"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CarouselItem>
            
            {/* Slide 3: Category × Offer Heatmap */}
            <CarouselItem className="h-full">
              <div className="h-full px-6 py-6">
                <div className="container mx-auto h-full">
                  <Card className="h-full flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle>Category × Offer Heatmap</CardTitle>
                      <CardDescription>
                        Strength index across all category and offer combinations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pt-2 pb-4">
                      <StrengthHeatmap data={heatmapData} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CarouselItem>
            
            {/* Slide 4: Combined AI Analysis */}
            <CarouselItem className="h-full">
              <div className="h-full px-6 py-6 flex items-center">
                <div className="container mx-auto">
                  <AISlideCombined />
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      </main>
    </div>
    </AIAnalysisProvider>
  );
}