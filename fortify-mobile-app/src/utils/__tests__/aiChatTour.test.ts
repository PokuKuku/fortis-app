import fs from 'fs';
import path from 'path';
import { AI_CHAT_OVERVIEW_COPY, shouldAutoStartVoiceCoach } from '@/src/utils/aiChatTour';

describe('shouldAutoStartVoiceCoach', () => {
  it('suppresses realtime startup during the tour', () => {
    expect(shouldAutoStartVoiceCoach(true, 'welcome')).toBe(false);
    expect(shouldAutoStartVoiceCoach(true, 'ai_chat_open')).toBe(false);
    expect(shouldAutoStartVoiceCoach(true, 'ai_chat_overview')).toBe(false);
    expect(shouldAutoStartVoiceCoach(true, 'insights_overview')).toBe(false);
  });

  it('preserves realtime startup outside the tour', () => {
    expect(shouldAutoStartVoiceCoach(false, 'ai_chat_overview')).toBe(true);
    expect(shouldAutoStartVoiceCoach(false, null)).toBe(true);
  });

  it('uses overview copy without hyphens or em dashes', () => {
    expect(AI_CHAT_OVERVIEW_COPY).not.toMatch(/[-—]/);
  });

  it('points users to Settings for Voice Coach customization', () => {
    expect(AI_CHAT_OVERVIEW_COPY).toContain('Settings');
    expect(AI_CHAT_OVERVIEW_COPY).toContain('Voice Coach');
    expect(AI_CHAT_OVERVIEW_COPY).toContain('Profile');
  });

  it('keeps in-app tour body copy free of hyphens and dash characters', () => {
    const tourContext = fs.readFileSync(
      path.join(__dirname, '../../contexts/InAppTourContext.tsx'),
      'utf8'
    );
    const bodyCopies = Array.from(tourContext.matchAll(/body:\s*('(?:[^'\\]|\\.)*'|AI_CHAT_OVERVIEW_COPY)/g))
      .map((match) => match[1]);

    expect(bodyCopies).toHaveLength(17);
    expect(bodyCopies.join('\n')).not.toMatch(/[-—–]/);
  });
});
