'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, RefreshCw, AlertCircle, TrendingUp, TrendingDown, Lightbulb } from 'lucide-react';
import { useAnalysis } from './ai-analysis-manager';

export function AISlideCombined() {
  const { analysis, isLoading, error, regenerate } = useAnalysis();

  return (
    <Card className="w-full h-[648px] flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Analysis
            </CardTitle>
            <CardDescription>
              Comprehensive AI-generated insights on IDEO's performance
            </CardDescription>
          </div>
          <Button
            onClick={regenerate}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Analysing...' : 'Regenerate'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-2 pb-4 flex-1 overflow-hidden relative">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F87700]"></div>
            <p className="text-sm text-muted-foreground">
              AI agent is analysing your data...
            </p>
          </div>
        )}

        {!isLoading && analysis && (
          <>
            <div className="space-y-8 max-h-[532px] overflow-y-auto pr-4 pb-8 scrollbar-always-visible">
              {/* Executive Summary Section */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-[#F87700]" />
                  <h3 className="text-xl font-semibold">Executive Summary</h3>
                </div>
                <p className="text-base leading-relaxed">
                  {analysis.executiveSummary}
                </p>
              </section>

              {/* SWOT Positive Section */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h3 className="text-xl font-semibold">Strengths & Opportunities</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-base font-semibold mb-2 text-green-700">Strengths</h4>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength, index) => (
                        <li key={index} className="flex gap-2 text-sm">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span className="flex-1">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-base font-semibold mb-2 text-blue-700">Opportunities</h4>
                    <ul className="space-y-2">
                      {analysis.opportunities.map((opportunity, index) => (
                        <li key={index} className="flex gap-2 text-sm">
                          <span className="text-blue-600 mt-0.5">→</span>
                          <span className="flex-1">{opportunity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* SWOT Negative Section */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="h-5 w-5 text-orange-600" />
                  <h3 className="text-xl font-semibold">Weaknesses & Threats</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-base font-semibold mb-2 text-orange-700">Weaknesses</h4>
                    <ul className="space-y-2">
                      {analysis.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex gap-2 text-sm">
                          <span className="text-orange-600 mt-0.5">!</span>
                          <span className="flex-1">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-base font-semibold mb-2 text-red-700">Threats</h4>
                    <ul className="space-y-2">
                      {analysis.threats.map((threat, index) => (
                        <li key={index} className="flex gap-2 text-sm">
                          <span className="text-red-600 mt-0.5">⚠</span>
                          <span className="flex-1">{threat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Recommendations Section */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-5 w-5 text-[#F87700]" />
                  <h3 className="text-xl font-semibold">Recommendations</h3>
                </div>
                <ul className="space-y-3">
                  {analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex gap-3 p-3 rounded-lg bg-secondary/50">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F87700] text-white flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </span>
                      <span className="flex-1 pt-0.5 text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
            {/* Scroll indicator gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card via-card/70 to-transparent pointer-events-none" />
          </>
        )}
      </CardContent>
    </Card>
  );
}

