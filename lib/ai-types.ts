export interface StructuredAnalysis {
  executiveSummary: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  recommendations: string[];
}

export interface StoredAnalysis {
  timestamp: string;
  analysis: StructuredAnalysis;
  tokenUsage: {
    reasoning: number;
    output: number;
  };
}