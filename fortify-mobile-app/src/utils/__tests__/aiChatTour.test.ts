import fs from 'fs';
import path from 'path';
import {
  AI_CHAT_OVERVIEW_COPY,
  AI_TEXT_CHAT_TOUR_COPY,
  getAIChatTourNarrationVoice,
  shouldPromptForFeatureAccess,
} from '@/src/utils/aiChatTour';

describe('aiChatTour', () => {
  it('defers feature access prompts until after the tour', () => {
    expect(shouldPromptForFeatureAccess(true)).toBe(false);
    expect(shouldPromptForFeatureAccess(false)).toBe(true);
  });

  it('uses Cedar tour narration only for male users', () => {
    expect(getAIChatTourNarrationVoice('male')).toBe('cedar');
    expect(getAIChatTourNarrationVoice('female')).toBe('default');
    expect(getAIChatTourNarrationVoice('other')).toBe('default');
    expect(getAIChatTourNarrationVoice(null)).toBe('default');
    expect(getAIChatTourNarrationVoice()).toBe('default');
  });

  it('uses overview copy without hyphens or em dashes', () => {
    expect(AI_CHAT_OVERVIEW_COPY).not.toMatch(/[-—]/);
  });

  it('points users to Settings for Voice Coach customization', () => {
    expect(AI_CHAT_OVERVIEW_COPY).toContain('Settings');
    expect(AI_CHAT_OVERVIEW_COPY).toContain('Voice Coach');
    expect(AI_CHAT_OVERVIEW_COPY).toContain('Profile');
  });

  it('explains that Chat can create personalized workout templates', () => {
    expect(AI_TEXT_CHAT_TOUR_COPY).toContain('personalized workout templates');
    expect(AI_TEXT_CHAT_TOUR_COPY).toContain('The more specific your request');
  });

  it('keeps in-app tour body copy free of hyphens and dash characters', () => {
    const tourContext = fs.readFileSync(
      path.join(__dirname, '../../contexts/InAppTourContext.tsx'),
      'utf8'
    );
    const bodyCopies = Array.from(tourContext.matchAll(/body:\s*('(?:[^'\\]|\\.)*'|AI_(?:TEXT_)?CHAT_OVERVIEW_COPY)/g))
      .map((match) => match[1]);

    expect(bodyCopies).toHaveLength(24);
    expect(bodyCopies.join('\n')).not.toMatch(/[-—–]/);
  });
});
