import type { AIWorkoutTemplate } from '@/src/types/ai';

const FOCUS_PATTERNS: Array<[string, RegExp]> = [
  ['Upper Body', /\bupper[\s_-]+body\b/i],
  ['Lower Body', /\blower[\s_-]+body\b/i],
  ['Full Body', /\bfull[\s_-]+body\b/i],
  ['Push', /\bpush\b/i],
  ['Pull', /\bpull\b/i],
  ['Chest', /\bchest|pecs?\b/i],
  ['Back', /\bback|lats?|latissimus|rows?\b/i],
  ['Shoulders', /\bshoulders?|delts?\b/i],
  ['Arms', /\barms?|biceps?|triceps?\b/i],
  ['Core', /\bcore|abs?\b/i],
  ['Glutes', /\bglutes?\b/i],
  ['Legs', /\blegs?|quads?|hamstrings?|calves?\b/i],
];

const FOCUS_NAME_PATTERN =
  /\b(upper[\s_-]+body|lower[\s_-]+body|full[\s_-]+body|push|pull|chest|back|shoulders?|arms?|core|abs|glutes?|legs?|quads?|hamstrings?|calves|lats)\b/i;

const MUSCLE_DISPLAY_LABELS: Record<string, string> = {
  upper_back: 'upper back',
  lower_back: 'lower back',
  upper_body: 'upper body',
  lower_body: 'lower body',
  full_body: 'full body',
  front_delts: 'front delts',
  rear_delts: 'rear delts',
  side_delts: 'side delts',
  middle_back: 'middle back',
};

const normalizeDisplayText = (value: string | undefined): string | undefined => {
  if (!value) return undefined;

  return value
    .replace(/\b[A-Za-z]+(?:[_-][A-Za-z]+)+\b/g, (token) => (
      MUSCLE_DISPLAY_LABELS[token.toLowerCase()] ?? token.replace(/[_-]+/g, ' ')
    ))
    .replace(/\s+/g, ' ')
    .trim();
};

const inferTemplateFocus = (template: AIWorkoutTemplate): string | null => {
  const source = `${template.focus ?? ''} ${template.description ?? ''}`.trim();
  if (!source) return null;
  return FOCUS_PATTERNS.find(([, pattern]) => pattern.test(source))?.[0] ?? null;
};

const stripDuplicateSuffix = (name: string): string => (
  name.replace(/\s+\(\d+\)\s*$/, '').trim()
);

const workoutNameMatchesFocus = (name: string, focus: string): boolean => {
  const focusPattern = new RegExp(`\\b${focus.replace(/\s+/g, '[\\s_-]+')}\\b`, 'i');
  return focusPattern.test(name);
};

const makeWorkoutNameForFocus = (name: string, focus: string): string => {
  const modifier = /\bstrength\b/i.test(name)
    ? 'Strength '
    : /\bhypertrophy\b/i.test(name)
      ? 'Hypertrophy '
      : /\bconditioning\b/i.test(name)
        ? 'Conditioning '
        : '';

  return `${focus} ${modifier}Workout`.replace(/\s+/g, ' ').trim();
};

export const normalizeAIWorkoutTemplateMetadata = (
  template: AIWorkoutTemplate
): AIWorkoutTemplate => {
  const inferredFocus = inferTemplateFocus(template);
  const normalizedName = stripDuplicateSuffix(normalizeDisplayText(template.name) ?? template.name);
  const normalizedFocus = normalizeDisplayText(template.focus);
  const normalizedDescription = normalizeDisplayText(template.description);

  if (
    !inferredFocus
    || !FOCUS_NAME_PATTERN.test(normalizedName)
    || workoutNameMatchesFocus(normalizedName, inferredFocus)
  ) {
    return {
      ...template,
      name: normalizedName,
      focus: normalizedFocus,
      description: normalizedDescription,
    };
  }

  return {
    ...template,
    name: makeWorkoutNameForFocus(normalizedName, inferredFocus),
    focus: inferredFocus,
    description: normalizedDescription,
  };
};
