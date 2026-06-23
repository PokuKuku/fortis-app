import type { WeightUnit } from '@/src/types/workout';
import { DEFAULT_TARGET_REPS } from '@/src/utils/workoutProgression';

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
const DEFAULT_PASTED_SET_COUNT = 3;

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

function stripListPrefix(value: string): string {
  return value.replace(/^\s*(?:\d+[.)]\s*|[-*•]\s+)/, '').trim();
}

function hasSeparatedPlainListTitle(lines: string[]): boolean {
  const firstContentIndex = lines.findIndex((line) => line.trim().length > 0);
  return firstContentIndex >= 0 && lines[firstContentIndex + 1]?.trim().length === 0;
}

export function parsePastedWorkout(text: string): ParsedPastedWorkout {
  const entries: PastedWorkoutEntry[] = [];
  const lines = text.replace(/\r/g, '').split('\n');
  const hasPrescription = lines.some((line) => PRESCRIPTION.test(stripListPrefix(line)));
  const workoutName = hasPrescription || hasSeparatedPlainListTitle(lines)
    ? detectWorkoutName(lines)
    : null;
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

  if (!hasPrescription) {
    const firstContentIndex = lines.findIndex((line) => line.trim().length > 0);
    const titleIndex = workoutName ? firstContentIndex : -1;
    lines.forEach((line, index) => {
      if (index === titleIndex) return;
      const sourceName = stripListPrefix(line);
      if (!sourceName) return;
      entries.push({
        sourceName,
        sets: DEFAULT_PASTED_SET_COUNT,
        reps: DEFAULT_TARGET_REPS,
        startingWeight: null,
        weightUnit: 'lbs',
      });
    });
    return { workoutName, entries };
  }

  for (let i = 0; i < lines.length; i += 1) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (!line || HEADING.test(line)) continue;
    const normalized = stripListPrefix(line);
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
