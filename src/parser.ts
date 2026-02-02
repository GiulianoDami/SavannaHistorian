import * as natural from 'natural';

// Define types for our parser
interface HistoricalText {
  content: string;
  author?: string;
  date?: string;
}

interface ParsedText {
  indicators: string[];
  ecosystemType: string;
  temporalContext: string;
}

class TextParser {
  private readonly vegetationWords: Set<string> = new Set([
    'grass', 'grassy', 'savanna', 'acacia', 'baobab', 'elephant', 'zebra',
    'giraffe', 'wildlife', 'wildebeest', 'lion', 'leopard', 'cheetah',
    'tree', 'trees', 'forest', 'woodland', 'bush', 'scrub', 'thorn',
    'palms', 'palm', 'mango', 'banana', 'coconut', 'cocoa', 'coffee',
    'grain', 'crops', 'maize', 'rice', 'wheat', 'sorghum', 'millet'
  ]);

  private readonly ecosystemKeywords: Record<string, string[]> = {
    savanna: ['savanna', 'grassland', 'acacia', 'baobab', 'elephant', 'zebra', 'giraffe'],
    forest: ['forest', 'woods', 'trees', 'tree', 'jungle', 'dense'],
    grassland: ['grass', 'grassy', 'pasture', 'meadow'],
    thorn: ['thorn', 'scrub', 'bush', 'dry', 'arid']
  };

  private readonly temporalWords: Set<string> = new Set([
    'ancient', 'old', 'former', 'past', 'historical', 'traditional', 'olden',
    'medieval', 'colonial', 'pre-colonial', 'early', 'century', 'years'
  ]);

  /**
   * Extracts ecological indicators from text
   */
  extractIndicators(text: string): string[] {
    const tokens = natural.WordTokenizer().tokenize(text.toLowerCase());
    const indicators: string[] = [];
    
    for (const token of tokens) {
      if (this.vegetationWords.has(token)) {
        indicators.push(token);
      }
    }
    
    return [...new Set(indicators)]; // Remove duplicates
  }

  /**
   * Parses historical text into structured ecological data
   */
  parse(text: HistoricalText): ParsedText {
    const indicators = this.extractIndicators(text.content);
    const ecosystemType = this.classifyEcosystem(indicators);
    const temporalContext = this.analyzeTemporalContext(text.content);
    
    return {
      indicators,
      ecosystemType,
      temporalContext
    };
  }

  /**
   * Classifies the ecosystem type based on extracted indicators
   */
  private classifyEcosystem(indicators: string[]): string {
    if (indicators.length === 0) return 'unknown';
    
    const scores: Record<string, number> = {};
    
    for (const [ecosystem, keywords] of Object.entries(this.ecosystemKeywords)) {
      scores[ecosystem] = 0;
      for (const keyword of keywords) {
        if (indicators.includes(keyword)) {
          scores[ecosystem]++;
        }
      }
    }
    
    // Return ecosystem with highest score
    return Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }

  /**
   * Analyzes temporal context from text
   */
  private analyzeTemporalContext(text: string): string {
    const tokens = natural.WordTokenizer().tokenize(text.toLowerCase());
    let temporalCount = 0;
    
    for (const token of tokens) {
      if (this.temporalWords.has(token)) {
        temporalCount++;
      }
    }
    
    if (temporalCount > 0) {
      return 'historical';
    }
    
    return 'modern';
  }
}

export { TextParser, HistoricalText, ParsedText };