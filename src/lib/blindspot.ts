import type { ContentItem, CognitiveBlindSpots } from '@/types';

// Scoring formula coefficients
const STANCE_BREADTH_SLOPE = 35;
const STANCE_BREADTH_BASE = 15;
const EVIDENCE_AWARENESS_SLOPE = 18;
const EVIDENCE_AWARENESS_BASE = 10;
const EMOTIONAL_RESILIENCE_SLOPE = 30;
const EMOTIONAL_RESILIENCE_BASE = 25;
const TEMPORAL_DEPTH_MAX_SCALE = 3;
const GEOGRAPHIC_VISION_MAX_SCALE = 3;
const SOURCE_DIVERSITY_MAX_SCALE = 5;
const DIVERSITY_SCORE_SLOPE = 80;
const DIVERSITY_SCORE_BASE = 20;

export function calculateCognitiveBlindSpots(recipe: ContentItem[]): CognitiveBlindSpots {
  if (recipe.length === 0) {
    return {
      stanceBreadth: 0,
      evidenceAwareness: 0,
      emotionalResilience: 0,
      temporalDepth: 0,
      geographicVision: 0,
      sourceDiversity: 0,
    };
  }

  const stances = recipe.map(i => i.dimensions.stance);
  const stanceRange = Math.max(...stances) - Math.min(...stances);
  const stanceBreadth = Math.min(100, stanceRange * STANCE_BREADTH_SLOPE + STANCE_BREADTH_BASE);

  const avgEvidence = recipe.reduce((s, i) => s + i.dimensions.evidence, 0) / recipe.length;
  const evidenceAwareness = Math.min(100, avgEvidence * EVIDENCE_AWARENESS_SLOPE + EVIDENCE_AWARENESS_BASE);

  const emotions = recipe.map(i => i.dimensions.emotion);
  const emotionRange = Math.max(...emotions) - Math.min(...emotions);
  const emotionalResilience = Math.min(100, emotionRange * EMOTIONAL_RESILIENCE_SLOPE + EMOTIONAL_RESILIENCE_BASE);

  const timeScales = new Set(recipe.map(i => i.dimensions.timeScale));
  const temporalDepth = Math.min(100, (timeScales.size / TEMPORAL_DEPTH_MAX_SCALE) * DIVERSITY_SCORE_SLOPE + DIVERSITY_SCORE_BASE);

  const geos = new Set(recipe.map(i => i.dimensions.geography));
  const geographicVision = Math.min(100, (geos.size / GEOGRAPHIC_VISION_MAX_SCALE) * DIVERSITY_SCORE_SLOPE + DIVERSITY_SCORE_BASE);

  const sourceTypes = new Set(recipe.map(i => i.dimensions.sourceType));
  const sourceDiversity = Math.min(100, (sourceTypes.size / SOURCE_DIVERSITY_MAX_SCALE) * DIVERSITY_SCORE_SLOPE + DIVERSITY_SCORE_BASE);

  return {
    stanceBreadth: Math.round(stanceBreadth),
    evidenceAwareness: Math.round(evidenceAwareness),
    emotionalResilience: Math.round(emotionalResilience),
    temporalDepth: Math.round(temporalDepth),
    geographicVision: Math.round(geographicVision),
    sourceDiversity: Math.round(sourceDiversity),
  };
}
