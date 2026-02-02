import * as natural from 'natural';

// Define types for our ecosystem classification
type EcosystemType = 'savanna' | 'forest' | 'grassland' | 'thorn_scrub' | 'unknown';

interface EcosystemResult {
  type: EcosystemType;
  confidence: number;
  indicators: string[];
}

class EcologicalClassifier {
  // Predefined keyword maps for each ecosystem type
  private readonly ecosystemKeywords: Record<EcosystemType, string[]> = {
    savanna: [
      'acacia', 'baobab', 'elephant', 'zebra', 'grass', 'grassy', 'open', 
      'scattered', 'trees', 'tree', 'savanna', 'kalahari', 'veld', 'grassland'
    ],
    forest: [
      'dense', 'canopy', 'timber', 'woods', 'woodlands', 'trees', 'tree', 
      'jungle', 'forest', 'understory', 'canopy', 'dense', 'wood', 'timber'
    ],
    grassland: [
      'grass', 'grassy', 'prairie', 'steppe', 'pasture', 'meadow', 'field', 
      'plain', 'plains', 'grassland', 'pampas', 'veld', 'sward'
    ],
    thorn_scrub: [
      'thorn', 'scrub', 'bush', 'cactus', 'dry', 'arid', 'semi-arid', 
      'drought', 'xeric', 'thornbush', 'acacia', 'mangrove', 'dryland'
    ],
    unknown: []
  };

  /**
   * Classifies a list of ecological indicators into an ecosystem type
   * @param indicators - List of textual indicators describing landscape
   * @returns EcosystemResult with type and confidence score
   */
  classify(indicators: string[]): EcosystemResult {
    if (!indicators || indicators.length === 0) {
      return {
        type: 'unknown',
        confidence: 0,
        indicators: []
      };
    }

    // Normalize indicators to lowercase for matching
    const normalizedIndicators = indicators.map(ind => ind.toLowerCase());
    
    // Score each ecosystem type
    const scores: Record<EcosystemType, number> = {
      savanna: 0,
      forest: 0,
      grassland: 0,
      thorn_scrub: 0,
      unknown: 0
    };

    // Count matches for each ecosystem type
    for (const indicator of normalizedIndicators) {
      for (const [ecosystem, keywords] of Object.entries(this.ecosystemKeywords)) {
        const ecosystemType = ecosystem as EcosystemType;
        if (keywords.some(keyword => 
          indicator.includes(keyword) || 
          natural.JaroWinklerDistance(indicator, keyword) > 0.8
        )) {
          scores[ecosystemType]++;
        }
      }
    }

    // Find the highest scoring ecosystem
    const maxScore = Math.max(...Object.values(scores));
    
    // If no matches found, return unknown
    if (maxScore === 0) {
      return {
        type: 'unknown',
        confidence: 0,
        indicators
      };
    }

    // Get all ecosystems with maximum score
    const topEcosystems = Object.entries(scores)
      .filter(([_, score]) => score === maxScore)
      .map(([ecosystem]) => ecosystem as EcosystemType);

    // For ties, prefer more specific categories
    const preferredOrder: EcosystemType[] = ['savanna', 'forest', 'grassland', 'thorn_scrub'];
    const finalType = topEcosystems.find(ecosystem => 
      preferredOrder.includes(ecosystem)
    ) || topEcosystems[0];

    return {
      type: finalType,
      confidence: maxScore / indicators.length,
      indicators
    };
  }

  /**
   * Scores the confidence of a classification result
   * @param result - The classification result to score
   * @returns A confidence score between 0 and 1
   */
  scoreConfidence(result: EcosystemResult): number {
    if (result.type === 'unknown') {
      return 0;
    }

    // Confidence is based on proportion of matched indicators
    // and the specificity of the match
    return Math.min(1, result.confidence);
  }
}

export { EcologicalClassifier };