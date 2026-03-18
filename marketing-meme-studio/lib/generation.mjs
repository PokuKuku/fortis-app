import { MUSCLE_KEYS } from './heatmap-data.mjs';

const MODEL = 'gpt-5-mini';

export function sanitizeCount(input) {
  const parsed = Number.parseInt(String(input ?? ''), 10);
  if (!Number.isFinite(parsed)) return 6;
  return Math.max(1, Math.min(12, parsed));
}

export function buildSchema(maxItems) {
  const muscleLevelProperties = Object.fromEntries(
    MUSCLE_KEYS.map((key) => [
      key,
      { type: 'integer', minimum: 1, maximum: 6 },
    ])
  );

  const bodySchema = {
    type: 'object',
    additionalProperties: false,
    required: ['gender', 'pose', 'muscleLevels'],
    properties: {
      gender: { type: 'string', enum: ['male', 'female'] },
      pose: { type: 'string', enum: ['front', 'back'] },
      muscleLevels: {
        type: 'object',
        additionalProperties: false,
        required: MUSCLE_KEYS,
        properties: muscleLevelProperties,
      },
    },
  };

  return {
    type: 'object',
    additionalProperties: false,
    required: ['concepts'],
    properties: {
      concepts: {
        type: 'array',
        minItems: 1,
        maxItems,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['title', 'subtitle', 'layout', 'bodyA', 'bodyB', 'labelA', 'labelB', 'rationale'],
          properties: {
            title: { type: 'string', minLength: 4, maxLength: 110 },
            subtitle: { type: 'string', minLength: 0, maxLength: 90 },
            layout: { type: 'string', enum: ['single_body', 'dual_body'] },
            bodyA: bodySchema,
            bodyB: {
              anyOf: [
                bodySchema,
                { type: 'null' },
              ],
            },
            labelA: { type: 'string', minLength: 0, maxLength: 24 },
            labelB: { type: 'string', minLength: 0, maxLength: 24 },
            rationale: { type: 'string', minLength: 0, maxLength: 220 },
          },
        },
      },
    },
  };
}

function buildMessages({
  brief,
  audience,
  tone,
  avoid,
  layouts,
  count,
  guidance,
}) {
  return [
    {
      role: 'system',
      content: [
        {
          type: 'input_text',
          text: [
            'You create meme concepts for Fortify, a workout tracking app.',
            'Output only structured JSON that fits the requested schema.',
            'These memes are for Instagram/TikTok marketing.',
            'They should be funny, specific, internet-native, and easy to read in one glance.',
            'Avoid generic productivity language, inspirational fluff, and long setup text.',
            'Every concept must make visual sense with a body heatmap.',
            'Use muscle emphasis to support the joke.',
            'single_body = one rendered body.',
            'dual_body = two rendered bodies side by side.',
            'Prefer readable top text: 1 strong title line plus 0-1 shorter subtitle line.',
            'Do not reference presets or internal implementation details.',
            'Do not use hateful, sexual, discriminatory, or unsafe content.',
          ].join(' '),
        },
      ],
    },
    {
      role: 'user',
      content: [
        {
          type: 'input_text',
          text: [
            `Generate ${count} meme concepts.`,
            `Allowed layouts: ${layouts.join(', ')}.`,
            `Campaign brief: ${brief || 'Promote Fortify through funny workout memes.'}`,
            `Audience: ${audience || 'Gym-goers and fitness app users.'}`,
            `Tone: ${tone || 'Sharp, funny, relatable.'}`,
            `Avoid: ${avoid || 'Nothing extra.'}`,
            guidance ? `Extra guidance: ${guidance}` : '',
            `Use only muscle keys from this list: ${MUSCLE_KEYS.join(', ')}.`,
            'Use values 1-6 for muscleLevels where 1 = E tier and 6 = S tier.',
            'Do not use 0 or an off/gray state for any muscle.',
            'If the joke is chest/abs focused, use front pose. If it is glute/hamstring/back focused, use back pose.',
            'For dual_body, contrast the two bodies clearly.',
          ].filter(Boolean).join('\n'),
        },
      ],
    },
  ];
}

function clampLevel(value) {
  const number = Number.parseInt(String(value ?? 1), 10);
  if (!Number.isFinite(number)) return 1;
  return Math.max(1, Math.min(6, number));
}

function normalizeMuscleLevels(levels = {}) {
  return Object.fromEntries(MUSCLE_KEYS.map((key) => [key, clampLevel(levels[key])]));
}

function normalizeBody(body = {}) {
  return {
    gender: body.gender === 'female' ? 'female' : 'male',
    pose: body.pose === 'back' ? 'back' : 'front',
    muscleLevels: normalizeMuscleLevels(body.muscleLevels),
  };
}

function normalizeConcept(concept = {}, index = 0) {
  const hasBodyB = Boolean(concept.bodyB);
  const layout = concept.layout === 'dual_body' && hasBodyB ? 'dual_body' : 'single_body';
  return {
    id: `concept-${Date.now()}-${index + 1}`,
    title: String(concept.title ?? '').trim(),
    subtitle: String(concept.subtitle ?? '').trim(),
    layout,
    labelA: String(concept.labelA ?? '').trim(),
    labelB: String(concept.labelB ?? '').trim(),
    rationale: String(concept.rationale ?? '').trim(),
    bodyA: normalizeBody(concept.bodyA),
    bodyB: layout === 'dual_body' ? normalizeBody(concept.bodyB) : null,
  };
}

function normalizeResponse(data) {
  const concepts = Array.isArray(data?.concepts) ? data.concepts : [];
  return concepts
    .map(normalizeConcept)
    .filter((concept) => concept.title.length > 0);
}

function tryParseJsonString(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function findStructuredCandidate(node, seen = new Set()) {
  if (!node || typeof node !== 'object') return null;
  if (seen.has(node)) return null;
  seen.add(node);

  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findStructuredCandidate(item, seen);
      if (found) return found;
    }
    return null;
  }

  if (Array.isArray(node.concepts)) {
    return node;
  }

  if (node.type === 'refusal' && typeof node.refusal === 'string') {
    throw new Error(`Model refused request: ${node.refusal}`);
  }

  const directObjectKeys = ['json', 'parsed'];
  for (const key of directObjectKeys) {
    if (node[key] && typeof node[key] === 'object') {
      const found = findStructuredCandidate(node[key], seen);
      if (found) return found;
    }
  }

  const directStringKeys = ['output_text', 'text', 'arguments'];
  for (const key of directStringKeys) {
    const parsed = tryParseJsonString(node[key]);
    if (parsed) {
      const found = findStructuredCandidate(parsed, seen);
      if (found) return found;
    }
  }

  for (const value of Object.values(node)) {
    const found = findStructuredCandidate(value, seen);
    if (found) return found;
  }

  return null;
}

function extractJsonText(payload) {
  if (typeof payload?.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text;
  }

  const content = payload?.output?.[0]?.content ?? [];
  const textBlock = content.find((item) => item.type === 'output_text' || item.type === 'text');
  if (textBlock?.text) {
    return textBlock.text;
  }

  const candidate = findStructuredCandidate(payload);
  if (candidate) {
    return JSON.stringify(candidate);
  }

  const payloadSnippet = JSON.stringify(payload).slice(0, 1200);
  throw new Error(`OpenAI response did not include structured text. Payload snippet: ${payloadSnippet}`);
}

export async function generateConcepts({
  apiKey,
  brief,
  audience,
  tone,
  avoid,
  layouts,
  count,
  guidance,
}) {
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY.');
  }

  const safeCount = sanitizeCount(count);
  const allowedLayouts = Array.isArray(layouts) && layouts.length > 0
    ? layouts.filter((layout) => layout === 'single_body' || layout === 'dual_body')
    : ['single_body', 'dual_body'];

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      input: buildMessages({
        brief,
        audience,
        tone,
        avoid,
        layouts: allowedLayouts,
        count: safeCount,
        guidance,
      }),
      text: {
        format: {
          type: 'json_schema',
          name: 'fortify_meme_batch',
          strict: true,
          schema: buildSchema(safeCount),
        },
      },
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${message}`);
  }

  const payload = await response.json();
  const parsed = JSON.parse(extractJsonText(payload));
  const concepts = normalizeResponse(parsed);

  if (concepts.length === 0) {
    throw new Error('The model returned no usable meme concepts.');
  }

  return concepts.slice(0, safeCount);
}
