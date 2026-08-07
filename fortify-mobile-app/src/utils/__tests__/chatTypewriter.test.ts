import {
  getChatTypewriterCharactersPerTick,
  shouldAnimateChatTypewriter,
} from '@/src/utils/chatTypewriter';

describe('chat typewriter', () => {
  const now = new Date('2026-08-06T18:10:00.000Z').getTime();

  it('animates only a fresh, unplayed assistant response', () => {
    expect(shouldAnimateChatTypewriter({
      isAssistant: true,
      animateText: true,
      reduceMotion: false,
      contentLength: 120,
      hasAnimated: false,
      createdAt: '2026-08-06T18:09:55.000Z',
      now,
    })).toBe(true);
  });

  it.each([
    { isAssistant: false, reduceMotion: false, hasAnimated: false, ageMs: 5_000 },
    { isAssistant: true, reduceMotion: true, hasAnimated: false, ageMs: 5_000 },
    { isAssistant: true, reduceMotion: false, hasAnimated: true, ageMs: 5_000 },
    { isAssistant: true, reduceMotion: false, hasAnimated: false, ageMs: 60_000 },
  ])('does not replay ineligible messages', ({ isAssistant, reduceMotion, hasAnimated, ageMs }) => {
    expect(shouldAnimateChatTypewriter({
      isAssistant,
      animateText: true,
      reduceMotion,
      contentLength: 120,
      hasAnimated,
      createdAt: new Date(now - ageMs).toISOString(),
      now,
    })).toBe(false);
  });

  it('speeds up long replies so the animation remains short', () => {
    expect(getChatTypewriterCharactersPerTick(20)).toBe(2);
    expect(getChatTypewriterCharactersPerTick(1_000)).toBeGreaterThan(1);
  });
});
