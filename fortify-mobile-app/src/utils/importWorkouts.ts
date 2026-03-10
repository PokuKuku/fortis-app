/**
 * CSV Import Utility
 *
 * Imports workout history from Strong/Hevy-style CSV files.
 */
import { getAllExercises, saveCustomExercise, isCustomExercise } from '@/src/services/exerciseService';
import { Exercise } from '@/src/types/exercise';
import { WorkoutSession, WorkoutExercise, WorkoutSet, SetType, RpeValue } from '@/src/types/workout';
import { generateSecureUUID } from './uuid';

export type ImportSource = 'strong' | 'generic';

export interface CsvImportResult {
  sessions: WorkoutSession[];
  createdCustomExercises: string[];
}

type CsvRow = Record<string, string>;

interface ParsedSet {
  setNumber: number;
  setType: SetType;
  weight: number | null;
  reps: number | null;
  rpe: RpeValue;
  restSeconds: number | null;
  notes: string;
  isCompleted: boolean;
}

interface ParsedExercise {
  name: string;
  equipment?: string | null;
  sets: ParsedSet[];
}

interface ParsedSession {
  importId: string;
  name: string;
  notes: string;
  startedAt: Date;
  completedAt: Date | null;
  exercises: ParsedExercise[];
}

interface ExerciseMatch {
  id: string;
  name: string;
  isCustom: boolean;
}

const REQUIRED_HEADERS: Record<ImportSource, string[]> = {
  strong: ['date', 'workout name', 'exercise name', 'set order'],
  generic: ['workoutname', 'exercise', 'setnumber'],
};

const DEFAULT_EXERCISE: Omit<Exercise, 'id' | 'name'> = {
  primaryMuscles: ['unknown'],
  secondaryMuscles: [],
  equipment: 'unknown',
  category: 'strength',
  instructions: ['Imported exercise - update details as needed'],
  images: [],
};

const CUSTOM_EXERCISE_PREFIX = 'custom-';

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const buildImportLocalId = (source: ImportSource, importId: string): string => {
  const normalized = importId
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  if (!normalized) {
    return `import-${source}-${generateSecureUUID()}`;
  }
  const prefix = normalized.length > 48 ? normalized.slice(0, 48) : normalized;
  return `import-${source}-${prefix}-${hashString(importId)}`;
};

const normalizeHeader = (value: string): string =>
  value.replace(/^\uFEFF/, '').trim().toLowerCase();

const normalizeName = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const parseNumber = (value?: string): number | null => {
  if (!value) return null;
  const parsed = Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : null;
};

const parseInteger = (value?: string): number | null => {
  if (!value) return null;
  const parsed = Number.parseInt(String(value).trim(), 10);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseBoolean = (value?: string): boolean => {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  if (['false', '0', 'no', 'n'].includes(normalized)) return false;
  return true;
};

const normalizeRpe = (value: number | null): RpeValue => {
  if (value === null) return null;
  const rounded = Math.round(value * 2) / 2;
  if (rounded < 6 || rounded > 10) return null;
  return rounded as RpeValue;
};

const parseDateTime = (value?: string, fallbackDate?: string): Date | null => {
  const candidate = value?.trim() || fallbackDate?.trim() || '';
  if (!candidate) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(candidate)) {
    const [year, month, day] = candidate.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  const normalized = candidate.includes('T')
    ? candidate
    : candidate.replace(' ', 'T');
  const parsed = new Date(normalized);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  return null;
};

const parseDurationSeconds = (value?: string): number | null => {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  const hourMatch = normalized.match(/(\d+)h/);
  const minMatch = normalized.match(/(\d+)m/);
  const secMatch = normalized.match(/(\d+)s/);
  const hours = hourMatch ? Number.parseInt(hourMatch[1], 10) : 0;
  const minutes = minMatch ? Number.parseInt(minMatch[1], 10) : 0;
  const seconds = secMatch ? Number.parseInt(secMatch[1], 10) : 0;
  if (!hours && !minutes && !seconds) return null;
  return hours * 3600 + minutes * 60 + seconds;
};

const parseExerciseLabel = (value: string): { name: string; equipment: string | null } => {
  const match = value.match(/^(.+?)\s*\((.+?)\)$/);
  if (match) {
    return {
      name: match[1].trim(),
      equipment: match[2].trim().toLowerCase(),
    };
  }
  return { name: value.trim(), equipment: null };
};

const parseStrongSetType = (value: string): SetType => {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'w' || normalized === 'warmup') return 'warmup';
  if (normalized === 'f' || normalized === 'failure') return 'failure';
  if (normalized === 'd' || normalized === 'dropset') return 'dropset';
  return 'normal';
};

const parseGenericSetType = (value?: string): SetType => {
  if (!value) return 'normal';
  const normalized = value.trim().toLowerCase();
  if (normalized.startsWith('w') || normalized.includes('warm')) return 'warmup';
  if (normalized.includes('drop')) return 'dropset';
  if (normalized.includes('fail')) return 'failure';
  return 'normal';
};

export const parseCsvRows = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        value += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(value);
      value = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && text[i + 1] === '\n') {
        i += 1;
      }
      row.push(value);
      value = '';
      if (row.some(cell => cell.trim() !== '')) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    value += char;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    if (row.some(cell => cell.trim() !== '')) {
      rows.push(row);
    }
  }

  return rows;
};

const parseCsvToObjects = (text: string): CsvRow[] => {
  const rows = parseCsvRows(text);
  if (rows.length === 0) return [];
  const header = rows[0].map((cell) => normalizeHeader(cell));
  const result: CsvRow[] = [];

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    if (row.every((cell) => cell.trim() === '')) continue;
    const entry: CsvRow = {};
    header.forEach((key, index) => {
      entry[key] = row[index] ?? '';
    });
    result.push(entry);
  }

  return result;
};

const validateHeaders = (rows: CsvRow[], source: ImportSource): void => {
  if (rows.length === 0) {
    throw new Error('CSV file is empty.');
  }
  const required = REQUIRED_HEADERS[source];
  const sample = rows[0];
  const missing = required.filter((key) => !(key in sample));
  if (missing.length > 0) {
    throw new Error(`CSV format mismatch. Missing headers: ${missing.join(', ')}`);
  }
};

const parseStrongRows = (rows: CsvRow[]): ParsedSession[] => {
  const sessions = new Map<string, { session: ParsedSession; exerciseMap: Map<string, ParsedExercise> }>();

  for (const row of rows) {
    const dateValue = row['date'];
    const workoutName = row['workout name']?.trim() || 'Workout';
    const exerciseValue = row['exercise name']?.trim();
    const setOrderRaw = row['set order']?.trim();
    const durationRaw = row['duration'];
    const notes = row['notes']?.trim() || '';
    const workoutNotes = row['workout notes']?.trim() || '';

    if (!dateValue || !exerciseValue || !setOrderRaw) continue;

    const startedAt = parseDateTime(dateValue);
    if (!startedAt) continue;

    const sessionKey = `${dateValue}-${workoutName}`;
    const durationSeconds = parseDurationSeconds(durationRaw);
    const completedAt = durationSeconds
      ? new Date(startedAt.getTime() + durationSeconds * 1000)
      : startedAt;

    if (!sessions.has(sessionKey)) {
      sessions.set(sessionKey, {
        session: {
          importId: sessionKey,
          name: workoutName,
          notes: workoutNotes,
          startedAt,
          completedAt,
          exercises: [],
        },
        exerciseMap: new Map(),
      });
    }

    const { session, exerciseMap } = sessions.get(sessionKey)!;
    const { name: exerciseName, equipment } = parseExerciseLabel(exerciseValue);

    if (setOrderRaw.toLowerCase() === 'rest timer') {
      const target = exerciseMap.get(exerciseName);
      if (target && target.sets.length > 0) {
        const restSeconds = parseNumber(row['seconds']);
        if (restSeconds !== null) {
          target.sets[target.sets.length - 1].restSeconds = restSeconds;
        }
      }
      continue;
    }

    const setNumber = parseInteger(setOrderRaw) ?? 1;
    const setType = parseStrongSetType(setOrderRaw);
    const weight = parseNumber(row['weight']);
    const reps = parseInteger(row['reps']);
    const rpe = normalizeRpe(parseNumber(row['rpe']));

    const parsedSet: ParsedSet = {
      setNumber,
      setType,
      weight,
      reps,
      rpe,
      restSeconds: null,
      notes,
      isCompleted: true,
    };

    let exercise = exerciseMap.get(exerciseName);
    if (!exercise) {
      exercise = {
        name: exerciseName,
        equipment,
        sets: [],
      };
      exerciseMap.set(exerciseName, exercise);
      session.exercises.push(exercise);
    }

    exercise.sets.push(parsedSet);
  }

  return Array.from(sessions.values()).map(({ session }) => session);
};

const parseGenericRows = (rows: CsvRow[]): ParsedSession[] => {
  const sessions = new Map<string, { session: ParsedSession; exerciseMap: Map<string, ParsedExercise> }>();

  for (const row of rows) {
    const workoutName = row['workoutname']?.trim() || 'Workout';
    const exerciseValue = row['exercise']?.trim();
    const setNumberRaw = row['setnumber']?.trim();
    const workoutId = row['workoutid']?.trim();
    const notes = row['notes']?.trim() || '';
    const workoutNotes = row['workout notes']?.trim() || '';
    const startTime = row['starttime'];
    const dateValue = row['date'];

    if (!exerciseValue || !setNumberRaw) continue;

    const startedAt = parseDateTime(startTime, dateValue);
    if (!startedAt) continue;

    const sessionKey = workoutId || `${workoutName}-${startedAt.toISOString()}`;

    if (!sessions.has(sessionKey)) {
      sessions.set(sessionKey, {
        session: {
          importId: sessionKey,
          name: workoutName,
          notes: workoutNotes,
          startedAt,
          completedAt: startedAt,
          exercises: [],
        },
        exerciseMap: new Map(),
      });
    }

    const { session, exerciseMap } = sessions.get(sessionKey)!;
    const setNumber = parseInteger(setNumberRaw) ?? 1;
    const setType = parseGenericSetType(row['settype']);
    const weight = parseNumber(row['weight']);
    const reps = parseInteger(row['reps']);
    const rpe = normalizeRpe(parseNumber(row['rpe']));
    const completed = parseBoolean(row['completed']);

    const parsedSet: ParsedSet = {
      setNumber,
      setType,
      weight,
      reps,
      rpe,
      restSeconds: null,
      notes,
      isCompleted: completed,
    };

    let exercise = exerciseMap.get(exerciseValue);
    if (!exercise) {
      exercise = {
        name: exerciseValue,
        equipment: null,
        sets: [],
      };
      exerciseMap.set(exerciseValue, exercise);
      session.exercises.push(exercise);
    }

    exercise.sets.push(parsedSet);
  }

  return Array.from(sessions.values()).map(({ session }) => session);
};

const buildExerciseResolver = async (): Promise<{
  resolve: (name: string, equipment?: string | null) => Promise<ExerciseMatch>;
  created: string[];
}> => {
  let exercises: Exercise[] = [];
  try {
    exercises = (await getAllExercises()) as Exercise[];
  } catch (error) {
    console.warn('Exercise lookup failed, creating custom exercises.', error);
  }

  const lookup = new Map<string, Exercise>();
  exercises.forEach((exercise) => {
    lookup.set(normalizeName(exercise.name), exercise);
  });

  const customCache = new Map<string, ExerciseMatch>();
  const created: string[] = [];

  const resolve = async (name: string, equipment?: string | null): Promise<ExerciseMatch> => {
    const key = normalizeName(name);
    const exact = lookup.get(key);
    if (exact) {
      return { id: exact.id, name: exact.name, isCustom: isCustomExercise(exact.id) };
    }

    const cached = customCache.get(key);
    if (cached) return cached;

    const customExercise: Exercise = {
      id: `${CUSTOM_EXERCISE_PREFIX}${generateSecureUUID()}`,
      name,
      ...DEFAULT_EXERCISE,
      equipment: equipment || DEFAULT_EXERCISE.equipment,
    };

    await saveCustomExercise(customExercise);
    const match = { id: customExercise.id, name: customExercise.name, isCustom: true };
    customCache.set(key, match);
    created.push(customExercise.name);
    return match;
  };

  return { resolve, created };
};

export const parseWorkoutCsv = async (
  text: string,
  source: ImportSource
): Promise<CsvImportResult> => {
  const rows = parseCsvToObjects(text);
  validateHeaders(rows, source);

  const parsedSessions = source === 'strong'
    ? parseStrongRows(rows)
    : parseGenericRows(rows);

  if (parsedSessions.length === 0) {
    return { sessions: [], createdCustomExercises: [] };
  }

  const { resolve, created } = await buildExerciseResolver();
  const sessions: WorkoutSession[] = [];

  for (const parsed of parsedSessions) {
    const sessionLocalId = buildImportLocalId(source, parsed.importId);
    const exercises: WorkoutExercise[] = [];
    for (const [index, exercise] of parsed.exercises.entries()) {
      const match = await resolve(exercise.name, exercise.equipment);
      const sets: WorkoutSet[] = exercise.sets.map((set, setIndex) => {
        const localId = `${sessionLocalId}-set-${index}-${setIndex}`;
        return {
          localId,
          setNumber: set.setNumber,
          setType: set.setType,
          weight: set.weight,
          weightUnit: null,
          reps: set.reps,
          rpe: set.rpe,
          restSeconds: set.restSeconds,
          notes: set.notes,
          isCompleted: set.isCompleted,
          orderIndex: setIndex,
        };
      });

      exercises.push({
        localId: `${sessionLocalId}-ex-${index}`,
        exerciseId: match.id,
        exerciseName: match.name,
        sets,
        notes: '',
        orderIndex: index,
      });
    }

    const completedAt = parsed.completedAt || parsed.startedAt;

    sessions.push({
      localId: sessionLocalId,
      name: parsed.name,
      notes: parsed.notes,
      startedAt: parsed.startedAt,
      completedAt,
      exercises,
      isSynced: false,
    });
  }

  return { sessions, createdCustomExercises: created };
};
