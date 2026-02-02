import * as natural from 'natural';
import { AnalysisConfig, HistoricalText, EcosystemResult, TemporalAnalysis } from './types';

export class SavannaHistorian {
  private tokenizer: natural.WordTokenizer;
  private classifier: natural.BayesClassifier;

  constructor(config: AnalysisConfig) {
    this.tokenizer = new natural.WordTokenizer();
    
    // Initialize classifier with sample training data
    this.classifier = new natural.BayesClassifier();
    
    // Training data for ecosystem classification
    this.classifier.addDocument('grassy plains with scattered trees', 'savanna');
    this.classifier.addDocument('open grasslands with acacia trees', 'savanna');
    this.classifier.addDocument('sparse vegetation with drought resistant plants', 'savanna');
    this.classifier.addDocument('dense forest with thick canopy', 'forest');
    this.classifier.addDocument('tropical rainforest with multiple layers', 'forest');
    this.classifier.addDocument('dry woodland with eucalyptus trees', 'forest');
    this.classifier.addDocument('grasslands with wildflowers', 'grassland');
    this.classifier.addDocument('steppe with tall grasses', 'grassland');
    this.classifier.addDocument('arid regions with cacti and succulents', 'thorn_scrub');
    this.classifier.addDocument('desert with sparse vegetation', 'thorn_scrub');
    
    this.classifier.train();
  }

  analyze(texts: HistoricalText[]): EcosystemResult[] {
    return texts.map(text => {
      const tokens = this.tokenizer.tokenize(text.content.toLowerCase());
      const classification = this.classifier.classify(tokens);
      
      return {
        textId: text.id,
        ecosystemType: classification,
        confidence: this.classifier.getClassifications(tokens)[0].value,
        extractedFeatures: this.extractFeatures(tokens),
        timestamp: text.timestamp
      };
    });
  }

  private extractFeatures(tokens: string[]): string[] {
    const features = [];
    const featureKeywords = {
      'savanna': ['grassy', 'scattered', 'acacia', 'drought'],
      'forest': ['dense', 'canopy', 'rainforest', 'woodland'],
      'grassland': ['grasslands', 'wildflowers', 'steppe'],
      'thorn_scrub': ['cacti', 'succulents', 'desert', 'arid']
    };

    Object.entries(featureKeywords).forEach(([ecosystem, keywords]) => {
      if (tokens.some(token => keywords.includes(token))) {
        features.push(ecosystem);
      }
    });

    return features;
  }

  analyzeTemporal(texts: HistoricalText[]): TemporalAnalysis {
    const results = this.analyze(texts);
    
    // Group by ecosystem type and timestamp
    const ecosystemTimeline: Record<string, { timestamps: number[], count: number }[]> = {};
    
    results.forEach(result => {
      if (!ecosystemTimeline[result.ecosystemType]) {
        ecosystemTimeline[result.ecosystemType] = [];
      }
      
      const existingEntry = ecosystemTimeline[result.ecosystemType].find(
        entry => entry.timestamps.includes(result.timestamp)
      );
      
      if (existingEntry) {
        existingEntry.count += 1;
      } else {
        ecosystemTimeline[result.ecosystemType].push({
          timestamps: [result.timestamp],
          count: 1
        });
      }
    });
    
    // Calculate trends
    const trends = Object.entries(ecosystemTimeline).map(([ecosystem, entries]) => {
      const sortedEntries = entries.sort((a, b) => 
        Math.min(...a.timestamps) - Math.min(...b.timestamps)
      );
      
      let trend = 'stable';
      if (sortedEntries.length > 1) {
        const firstCount = sortedEntries[0].count;
        const lastCount = sortedEntries[sortedEntries.length - 1].count;
        
        if (firstCount < lastCount) {
          trend = 'increasing';
        } else if (firstCount > lastCount) {
          trend = 'decreasing';
        }
      }
      
      return {
        ecosystemType: ecosystem,
        trend,
        timeline: sortedEntries
      };
    });
    
    return {
      trends,
      totalAnalyses: results.length,
      ecosystemDistribution: Object.fromEntries(
        Object.entries(ecosystemTimeline).map(([ecosystem, entries]) => [
          ecosystem,
          entries.reduce((sum, entry) => sum + entry.count, 0)
        ])
      )
    };
  }
}