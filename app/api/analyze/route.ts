import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { dataset } = await req.json();

    if (!dataset || !dataset.records) {
      return NextResponse.json(
        { error: 'Invalid dataset provided' },
        { status: 400 }
      );
    }

    // Prepare data summary for AI analysis
    const dataSummary = prepareDataSummary(dataset);

    // Call AI for analysis using gpt-5-mini
    const response = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert business analyst. Analyze business data and provide structured analysis in valid JSON format only.'
        },
        {
          role: 'user',
          content: `Analyze the following IDEO business data and provide a structured analysis.

Return your response as a valid JSON object with this exact structure:
{
  "executiveSummary": "A concise 3-4 sentence overview of IDEO's overall performance, highlighting the most critical findings.",
  "strengths": ["List 3-5 key strengths with specific data points"],
  "weaknesses": ["List 3-5 key weaknesses with specific data points"],
  "opportunities": ["List 3-5 key opportunities for growth"],
  "threats": ["List 3-5 key threats or challenges"],
  "recommendations": ["List 3-5 specific, actionable recommendations"]
}

Data Summary:
${dataSummary}

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code blocks, no additional text.`
        }
      ],
    });

    // Parse the JSON response
    const responseText = response.choices[0].message.content || '';
    let analysisData;
    try {
      analysisData = JSON.parse(responseText);
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse AI response as JSON');
      }
    }

    return NextResponse.json({
      analysis: analysisData,
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
    });
  } catch (error: any) {
    console.error('Error calling AI analysis:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate analysis' },
      { status: 500 }
    );
  }
}

function prepareDataSummary(dataset: any): string {
  const records = dataset.records;
  
  // Group by category
  const categoryGroups = new Map<string, any[]>();
  records.forEach((record: any) => {
    const category = record.Category;
    if (!categoryGroups.has(category)) {
      categoryGroups.set(category, []);
    }
    categoryGroups.get(category)!.push(record);
  });

  // Group by offer
  const offerGroups = new Map<string, any[]>();
  records.forEach((record: any) => {
    const offer = record['Offer-Sub Offer'];
    if (!offerGroups.has(offer)) {
      offerGroups.set(offer, []);
    }
    offerGroups.get(offer)!.push(record);
  });

  // Calculate statistics
  const categoryStats = Array.from(categoryGroups.entries()).map(([category, deals]) => {
    const total = deals.length;
    const won = deals.filter(d => d['Deal Stage']?.toLowerCase().includes('won') || d['Deal Stage']?.toLowerCase() === 'delivered').length;
    const signed = deals.filter(d => 
      d['Deal Stage']?.toLowerCase().includes('signed') || 
      d['Deal Stage']?.toLowerCase().includes('qualified') ||
      d['Deal Stage']?.toLowerCase().includes('proposal')
    ).length;
    const winRate = total > 0 ? ((won / total) * 100).toFixed(1) : '0.0';
    
    return { category, total, won, signed, winRate };
  }).sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate));

  const offerStats = Array.from(offerGroups.entries()).map(([offer, deals]) => {
    const total = deals.length;
    const won = deals.filter(d => d['Deal Stage']?.toLowerCase().includes('won') || d['Deal Stage']?.toLowerCase() === 'delivered').length;
    const winRate = total > 0 ? ((won / total) * 100).toFixed(1) : '0.0';
    
    return { offer, total, won, winRate };
  }).sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate));

  // Build summary
  let summary = `## Overall Statistics\n`;
  summary += `- Total Deals: ${records.length}\n`;
  summary += `- Date Range: ${dataset.meta.lastUpdated}\n\n`;

  summary += `## Category Performance\n`;
  categoryStats.forEach(({ category, total, won, signed, winRate }) => {
    summary += `- **${category}**: ${total} deals, ${won} won, ${signed} signed, ${winRate}% win rate\n`;
  });

  summary += `\n## Top Offers by Win Rate\n`;
  offerStats.slice(0, 10).forEach(({ offer, total, won, winRate }) => {
    summary += `- **${offer}**: ${total} deals, ${won} won, ${winRate}% win rate\n`;
  });

  // Deal stage distribution
  const stageGroups = new Map<string, number>();
  records.forEach((record: any) => {
    const stage = record['Deal Stage'] || 'Unknown';
    stageGroups.set(stage, (stageGroups.get(stage) || 0) + 1);
  });

  summary += `\n## Deal Stage Distribution\n`;
  Array.from(stageGroups.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([stage, count]) => {
      summary += `- ${stage}: ${count} deals\n`;
    });

  return summary;
}