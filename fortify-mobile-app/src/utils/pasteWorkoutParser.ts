import type { WeightUnit } from '@/src/types/workout';

export type PastedWorkoutEntry = {
  sourceName: string;
  sets: number;
  reps: string;
  startingWeight: number | null;
  weightUnit: WeightUnit;
};

export type ParsedPastedWorkout = {
  workoutName: string | null;
  entries: PastedWorkoutEntry[];
};

const HEADING = /^\s*(?:day\s*\d+.*|\([^)]*\)|[A-Za-z ]+):?\s*$/i;
const PRESCRIPTION = /(?:^|[:\-–—]\s*|\s)(\d{1,2})\s*(?:sets?|set)?\s*(?:x|×|of)\s*(\d+(?:\s*(?:[-–]|to)\s*\d+)?)\s*(?:reps?)?/i;
const WEIGHT = /(\d+(?:\.\d+)?)\s*(lb|lbs|pound|pounds|kg|kgs|kilogram|kilograms)\b/i;

function normalizeRepRange(value: string): string {
  return value.replace(/\s*(?:[-–]|to)\s*/gi, '-').trim();
}

function detectWorkoutName(lines: string[]): string | null {
  const firstLine = lines.map((line) => line.trim()).find(Boolean) ?? '';
  if (
    !firstLine
    || firstLine.length > 80
    || /^\d+[.)]\s+/.test(firstLine)
    || /^\([^)]*\)\s*$/.test(firstLine)
    || PRESCRIPTION.test(firstLine)
  ) {
    return null;
  }

  return firstLine.slice(0, 50);
}

export function parsePastedWorkout(text: string): ParsedPastedWorkout {
  const entries: PastedWorkoutEntry[] = [];
  const lines = text.replace(/\r/g, '').split('\n');
  const workoutName = detectWorkoutName(lines);
  const addEntry = (name: string, prescription: RegExpMatchArray, trailing = '') => {
    const weight = trailing.match(WEIGHT);
    entries.push({
      sourceName: name,
      sets: Math.max(1, Math.min(13, Number(prescription[1]))),
      reps: normalizeRepRange(prescription[2]),
      startingWeight: weight ? Number(weight[1]) : null,
      weightUnit: /^(?:kg|kgs|kilogram|kilograms)$/i.test(weight?.[2] ?? '') ? 'kg' : 'lbs',
    });
  };
  for (let i = 0; i < lines.length; i += 1) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (!line || HEADING.test(line)) continue;
    const normalized = line.replace(/^\d+[.)]\s*/, '');
    const prescription = normalized.match(PRESCRIPTION);
    if (prescription) {
      const name = normalized
        .slice(0, prescription.index)
        .replace(/\s*\([^)]*\)/g, '')
        .replace(/[:\-–—]+\s*$/, '')
        .trim();
      if (name) addEntry(name, prescription, normalized.slice((prescription.index ?? 0) + prescription[0].length));
      continue;
    }
    const next = lines[i + 1]?.trim();
    const nextPrescription = next?.match(new RegExp(`^${PRESCRIPTION.source}`, 'i'));
    if (nextPrescription) {
      addEntry(
        normalized.replace(/\s*\([^)]*\)/g, '').trim(),
        nextPrescription,
        next.slice(nextPrescription[0].length)
      );
      i += 1;
    }
  }
  return { workoutName, entries };
}
