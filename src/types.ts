import { Natural } from 'natural';

export interface HistoricalText {
  id: string;
  content: string;
  author?: string;
  date?: string;
  source?: string;
  location?: string;
}

export interface AnalysisConfig {
  includeTemporalAnalysis?: boolean;
  confidenceThreshold?: number;
  includeComparativeAnalysis?: boolean;
}

export interface EcosystemResult {
  type: EcosystemType;
  confidence: number;
  description: string;
  supportingPhrases: string[];
}

export interface ComparisonResult {
  historicalEcosystem: EcosystemResult;
  modernEcosystem: EcosystemResult;
  changeLikelihood: number;
  recommendations: string[];
}

export type EcosystemType = 
  | 'savanna' 
  | 'forest' 
  | 'grassland' 
  | 'thorn_scrub' 
  | 'wetland' 
  | 'desert';

export type SourceType = 
  | 'manuscript' 
  | 'poem' 
  | 'folk_song' 
  | 'historical_account' 
  | 'scientific_text';