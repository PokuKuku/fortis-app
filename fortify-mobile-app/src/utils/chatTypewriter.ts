export const CHAT_TYPEWRITER_TICK_MS = 28;

const MESSAGE_MAX_AGE_MS = 30_000;
const MIN_DURATION_MS = 500;
const MAX_DURATION_MS = 2_800;

interface TypewriterEligibility {
  isAssistant: boolean;
  animateText: boolean;
  reduceMotion: boolean;
  contentLength: number;
  hasAnimated: boolean;
  createdAt: string;
  now?: number;
}

export function shouldAnimateChatTypewriter({
  isAssistant,
  animateText,
  reduceMotion,
  contentLength,
  hasAnimated,
  createdAt,
  now = Date.now(),
}: TypewriterEligibility): boolean {
  const createdAtMs = new Date(createdAt).getTime();
  const age = now - createdAtMs;
  return isAssistant
    && animateText
    && !reduceMotion
    && contentLength > 0
    && !hasAnimated
    && Number.isFinite(age)
    && age >= 0
    && age <= MESSAGE_MAX_AGE_MS;
}

export function getChatTypewriterCharactersPerTick(contentLength: number): number {
  const duration = Math.min(
    MAX_DURATION_MS,
    Math.max(MIN_DURATION_MS, contentLength * 18)
  );
  const totalTicks = Math.max(1, Math.ceil(duration / CHAT_TYPEWRITER_TICK_MS));
  return Math.max(1, Math.ceil(contentLength / totalTicks));
}
