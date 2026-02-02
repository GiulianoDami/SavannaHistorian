import * as natural from 'natural';
import { EcosystemResult } from './types';

export interface ComparisonResult {
  matches: EcosystemResult[];
  confidence: number;
  discrepancies: string[];
}

export class ModernDataIntegrator {
  private tokenizer = new natural.WordTokenizer();
  private stemmer = natural.PorterStemmer;

  compare(historical: EcosystemResult[], modernData: Buffer): ComparisonResult {
    const modernText = modernData.toString('utf-8');
    const modernTokens = this.tokenizer.tokenize(modernText.toLowerCase());
    
    // Simple stemming for better matching
    const stemmedTokens = modernTokens.map(token => 
      this.stemmer.stem(token)
    );
    
    const matches: EcosystemResult[] = [];
    const discrepancies: string[] = [];
    
    // For each historical result, check if modern data contains relevant terms
    for (const hist of historical) {
      let matchCount = 0;
      const histTerms = hist.description.toLowerCase().split(/\s+/);
      
      for (const term of histTerms) {
        const stemmedTerm = this.stemmer.stem(term);
        if (stemmedTokens.includes(stemmedTerm)) {
          matchCount++;
        }
      }
      
      // Calculate confidence as ratio of matched terms
      const confidence = matchCount / Math.max(histTerms.length, 1);
      
      if (confidence > 0.3) {
        matches.push({
          ...hist,
          confidence
        });
      } else {
        discrepancies.push(`Discrepancy found for ${hist.ecosystemType}: ${hist.description}`);
      }
    }
    
    return {
      matches,
      confidence: matches.length > 0 ? 
        matches.reduce((sum, m) => sum + m.confidence, 0) / matches.length : 0,
      discrepancies
    };
  }
}

export class ConservationPlanner {
  generateRecommendation(analysis: EcosystemResult[]): string {
    if (analysis.length === 0) {
      return "No analysis data available for recommendation.";
    }

    const ecosystemTypes = analysis.map(a => a.ecosystemType);
    const uniqueEcosystems = [...new Set(ecosystemTypes)];
    
    if (uniqueEcosystems.length === 1) {
      const type = uniqueEcosystems[0];
      return `Conservation focus should be on maintaining ${type} ecosystem integrity. Historical data confirms this landscape type's natural occurrence.`;
    }
    
    // If multiple ecosystem types found
    const dominantType = ecosystemTypes.reduce((a, b) => 
      ecosystemTypes.filter(v => v === a).length >= ecosystemTypes.filter(v => v === b).length ? a : b
    );
    
    return `Mixed ecosystem detected. Primary focus should be on preserving the ${dominantType} ecosystem while considering historical landscape transitions between different ecosystem types.`;
  }
}