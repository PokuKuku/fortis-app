import {
  ACCENT_COLORS,
  generateAccentThemeColors,
  getAccentPalette,
  getAccentGradient,
} from '@/src/utils/accentColors';

describe('mode-aware accent colors', () => {
  it('uses a brighter Midnight palette in dark mode', () => {
    const colors = generateAccentThemeColors('midnight', true);

    expect(colors.accent).toBe('#677890');
    expect(colors.accentLight).toBe('#94a3b8');
    expect(colors.accentDark).toBe('#475569');
    expect(colors.accentGradient).toEqual(['#94a3b8', '#677890']);
    expect(getAccentPalette('midnight', true).base).toBe('#677890');
  });

  it('preserves the original Midnight palette in light mode', () => {
    const colors = generateAccentThemeColors('midnight', false);

    expect(colors.accent).toBe(ACCENT_COLORS.midnight.base);
    expect(colors.accentGradient).toEqual([
      ACCENT_COLORS.midnight.base,
      ACCENT_COLORS.midnight.dark,
    ]);
  });

  it('preserves the existing light-mode Frost override', () => {
    expect(getAccentGradient('slate', false)).toEqual(['#5f6f84', '#475569']);
  });
});
