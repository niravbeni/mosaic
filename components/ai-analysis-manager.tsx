'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Dataset } from '@/lib/types';
import { StructuredAnalysis } from '@/lib/ai-types';

interface AnalysisContextType {
  analysis: StructuredAnalysis | null;
  isLoading: boolean;
  error: string | null;
  tokenUsage: { reasoning: number; output: number } | null;
  regenerate: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | null>(null);

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within AIAnalysisProvider');
  }
  return context;
}

interface AIAnalysisProviderProps {
  dataset: Dataset;
  children: ReactNode;
}

export function AIAnalysisProvider({ dataset, children }: AIAnalysisProviderProps) {
  const [analysis, setAnalysis] = useState<StructuredAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenUsage, setTokenUsage] = useState<{ reasoning: number; output: number } | null>(null);
  const [datasetTimestamp, setDatasetTimestamp] = useState<string>('');

  const STORAGE_KEY = 'ideo-ai-analysis';

  const generateAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dataset }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate analysis');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      setTokenUsage({
        reasoning: data.reasoningTokens,
        output: data.outputTokens,
      });

      // Store analysis with dataset timestamp
      const analysisData = {
        timestamp: dataset.meta.lastUpdated,
        analysis: data.analysis,
        tokenUsage: {
          reasoning: data.reasoningTokens,
          output: data.outputTokens,
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(analysisData));
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      console.error('Error generating analysis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load stored analysis or generate new one when dataset changes
  useEffect(() => {
    const currentTimestamp = dataset.meta.lastUpdated;

    // Check if dataset has changed
    if (currentTimestamp !== datasetTimestamp) {
      setDatasetTimestamp(currentTimestamp);
      
      // Try to load stored analysis
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const analysisData = JSON.parse(stored);
          
          // If stored analysis matches current dataset, use it
          if (analysisData.timestamp === currentTimestamp) {
            setAnalysis(analysisData.analysis);
            setTokenUsage(analysisData.tokenUsage);
            return;
          }
        }
      } catch (err) {
        console.error('Error loading stored analysis:', err);
      }

      // No valid stored analysis, generate new one
      generateAnalysis();
    }
  }, [dataset.meta.lastUpdated]);

  return (
    <AnalysisContext.Provider
      value={{
        analysis,
        isLoading,
        error,
        tokenUsage,
        regenerate: generateAnalysis,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}