/**
 * Suggestion Scorer
 *
 * Deduplicates, scores, and ranks suggestion candidates.
 */

import { SuggestionCandidate } from '../types/suggestions';

/**
 * Source priority multipliers
 * Higher-context sources get boosted
 */
const SOURCE_MULTIPLIERS: Record<SuggestionCandidate['source'], number> = {
  conversation: 1.3, // Clarification options are highest priority
  mutation: 1.2, // Active mutation context is important
  fitness: 1.0, // User-specific fitness data
  time: 0.8, // Time context is supplementary
  default: 0.6, // Fallbacks are lowest priority
};

/**
 * Normalize text for deduplication
 */
function normalizeText(text: string): string {
  return text.toLowerCase().trim();
}

/**
 * Deduplicate suggestions, keeping highest-scored version
 */
function deduplicateSuggestions(
  candidates: SuggestionCandidate[]
): SuggestionCandidate[] {
  const seen = new Map<string, SuggestionCandidate>();

  for (const candidate of candidates) {
    const key = normalizeText(candidate.text);
    const existing = seen.get(key);

    if (!existing || candidate.score > existing.score) {
      seen.set(key, candidate);
    }
  }

  return Array.from(seen.values());
}

/**
 * Rank suggestions and return top N
 */
export function rankSuggestions(
  candidates: SuggestionCandidate[],
  maxResults: number = 4
): string[] {
  // Skip if no candidates
  if (candidates.length === 0) {
    return [];
  }

  // Deduplicate
  const unique = deduplicateSuggestions(candidates);

  // Apply source multipliers
  const scored = unique.map((c) => ({
    ...c,
    finalScore: c.score * SOURCE_MULTIPLIERS[c.source],
  }));

  // Sort by final score descending
  scored.sort((a, b) => b.finalScore - a.finalScore);

  // Return top N texts
  return scored.slice(0, maxResults).map((s) => s.text);
}
