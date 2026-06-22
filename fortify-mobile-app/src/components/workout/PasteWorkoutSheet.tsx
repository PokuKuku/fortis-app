import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useExercises } from '@/src/hooks/useExercises';
import { buildExerciseSearchIndex, searchExercisesWithScores } from '@/src/utils/exerciseSearch';
import type { ExerciseWithSource } from '@/src/types/exercise';
import { parsePastedWorkout } from '@/src/utils/pasteWorkoutParser';
import { useTheme } from '@/src/contexts/ThemeContext';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { BorderRadius, Spacing } from '@/constants/Sizes';

export type ImportedExercise = {
  id: string;
  name: string;
  initialSetCount: number;
  reps: string;
  startingWeight: number | null;
  weightUnit: 'lbs' | 'kg';
};

export type UnresolvedPastedExercise = Omit<ImportedExercise, 'id' | 'name'> & {
  sourceName: string;
  matches: ExerciseWithSource[];
};

const MATCH_STOP_WORDS = new Set(['a', 'an', 'and', 'for', 'of', 'or', 'the', 'to', 'with']);

function getMatchTerms(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[_/]+/g, ' ')
    .replace(/[-–—]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((term) => term.replace(/ies$/, 'y').replace(/s$/, ''))
    .filter((term) => term.length > 1 && !MATCH_STOP_WORDS.has(term));
}

function getPasteCandidates(
  sourceName: string,
  exercises: ExerciseWithSource[],
  index: ReturnType<typeof buildExerciseSearchIndex>
): Array<{ exercise: ExerciseWithSource; score: number; exactName: boolean }> {
  const queryTerms = getMatchTerms(sourceName);
  const normalizedSource = sourceName.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const searchScores = new Map(
    searchExercisesWithScores(sourceName, index, { includeInstructions: false })
      .map((result) => [result.exercise.id, result.score])
  );

  return exercises
    .map((exercise) => {
      const searchableText = [exercise.name, exercise.slug, ...(exercise.aliases ?? [])]
        .filter(Boolean)
        .join(' ');
      const exerciseTerms = new Set(getMatchTerms(searchableText));
      const sharedTermCount = queryTerms.filter((term) => exerciseTerms.has(term)).length;
      const normalizedName = exercise.name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      const exactName = normalizedName === normalizedSource;
      const containsSource = normalizedName.includes(normalizedSource);

      return {
        exercise,
        exactName,
        // Exercise-term overlap is mandatory. The search score only breaks ties
        // after that, preventing unrelated fuzzy results from being displayed.
        score: sharedTermCount === 0
          ? -1
          : (exactName ? 10_000 : 0) + (containsSource ? 5_000 : 0) + sharedTermCount * 100 + (searchScores.get(exercise.id) ?? 0),
      };
    })
    .filter((candidate) => candidate.score >= 0)
    .sort((a, b) => b.score - a.score || a.exercise.name.localeCompare(b.exercise.name))
    .slice(0, 5);
}

export function PasteWorkoutSheet({
  visible,
  onClose,
  onAdd,
  onResolve,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (entries: ImportedExercise[], workoutName: string | null) => void;
  onResolve: (entries: UnresolvedPastedExercise[]) => void;
}) {
  const { colors, isDark } = useTheme();
  const { exercises } = useExercises();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const index = useMemo(() => buildExerciseSearchIndex(exercises), [exercises]);

  const paste = async () => {
    setText(await Clipboard.getStringAsync());
    setError(null);
  };

  const importWorkout = () => {
    const parsed = parsePastedWorkout(text);
    const unresolved: UnresolvedPastedExercise[] = [];
    const imported = parsed.entries.flatMap((entry) => {
      const candidates = getPasteCandidates(entry.sourceName, exercises, index);
      const match = candidates[0];
      if (!match || !match.exactName) {
        unresolved.push({
          sourceName: entry.sourceName,
          initialSetCount: entry.sets,
          reps: entry.reps,
          startingWeight: entry.startingWeight,
          weightUnit: entry.weightUnit,
          matches: candidates.map((candidate) => candidate.exercise),
        });
        return [];
      }
      return [{
        id: match.exercise.id,
        name: match.exercise.name,
        initialSetCount: entry.sets,
        reps: entry.reps,
        startingWeight: entry.startingWeight,
        weightUnit: entry.weightUnit,
      }];
    });

    if (imported.length === 0 && unresolved.length === 0) {
      setError('No exercises could be matched. Check the names and try again.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (imported.length > 0 || parsed.workoutName) onAdd(imported, parsed.workoutName);
    if (unresolved.length > 0) onResolve(unresolved);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, {
          backgroundColor: colors.background,
          borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
        }]}>
          <StainlessSteelPattern />
          <View style={[styles.handle, { backgroundColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }]} />
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Paste Workout</Text>
          </View>
          <TextInput
            value={text}
            onChangeText={(value) => { setText(value); setError(null); }}
            multiline
            scrollEnabled
            numberOfLines={4}
            placeholder="Turn your workout notes into a template"
            placeholderTextColor={colors.textTertiary}
            style={[styles.input, {
              color: colors.textPrimary,
              borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            }]}
          />
          {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
          <View style={styles.row}>
            <Pressable style={[styles.secondary, { borderColor: colors.accentBorder }]} onPress={() => void paste()}>
              <Text style={[styles.secondaryText, { color: colors.accent }]}>Paste Clipboard</Text>
            </Pressable>
            <Pressable style={[styles.secondary, { borderColor: colors.accentBorder }]} onPress={importWorkout}>
              <Text style={[styles.secondaryText, { color: colors.accent }]}>Import Workout</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl, gap: Spacing.lg, overflow: 'hidden' },
  handle: { width: 42, height: 4, borderRadius: 999, alignSelf: 'center', marginTop: Spacing.sm },
  header: { alignItems: 'center' },
  title: { fontSize: 24, fontFamily: 'BankGothicBT-Medium', fontWeight: '800', textTransform: 'uppercase', textAlign: 'center' },
  input: { height: 132, borderWidth: 1, borderRadius: BorderRadius.md, padding: Spacing.md, textAlignVertical: 'top', fontSize: 16 },
  error: { fontSize: 13, textAlign: 'center' },
  row: { flexDirection: 'row', gap: Spacing.md },
  secondary: { flex: 1, borderWidth: 1, borderRadius: BorderRadius.md, minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontSize: 15, fontFamily: 'BankGothicBT-Medium', fontWeight: '700' },
});
