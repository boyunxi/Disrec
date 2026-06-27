// Re-export all types from constants for backward compatibility
export type {
  Dimensions,
  ContentItem,
  BodySection,
  BalanceScore,
  BlindSpotScores as CognitiveBlindSpots,
  FeedbackType,
  FilterType,
} from '@/data/constants';

export interface RadarDimension {
  key: 'stanceBreadth' | 'evidenceAwareness' | 'emotionalResilience' | 'temporalDepth' | 'geographicVision' | 'sourceDiversity';
  label: string;
  icon: string;
}
