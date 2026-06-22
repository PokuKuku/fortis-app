import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { getCachedExerciseImageSource } from '@/src/utils/exerciseImageCache';
import type { ImportedExercise, UnresolvedPastedExercise } from '@/src/components/workout/PasteWorkoutSheet';
import { BorderRadius, Spacing } from '@/constants/Sizes';

type ResolvedPastedExercise = ImportedExercise & { sourceName: string };

export function PasteWorkoutMatchResolver({
  entries,
  onComplete,
  onDismiss,
}: {
  entries: UnresolvedPastedExercise[];
  onComplete: (entries: ImportedExercise[]) => void;
  onDismiss: () => void;
}) {
  const { colors, isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState<Record<number, ResolvedPastedExercise>>({});

  useEffect(() => {
    setCurrentIndex(0);
    setSelections({});
  }, [entries]);

  const entry = entries[currentIndex];
  if (!entry) return null;

  const finish = (nextSelections = selections) => {
    onComplete(Object.values(nextSelections).map(({ sourceName: _sourceName, ...selection }) => selection));
  };

  const moveForward = (nextSelections = selections) => {
    if (currentIndex === entries.length - 1) {
      finish(nextSelections);
      return;
    }
    setCurrentIndex((index) => index + 1);
  };

  const selectExercise = (id: string, name: string) => {
    const nextSelections = {
      ...selections,
      [currentIndex]: {
        id,
        name,
        sourceName: entry.sourceName,
        initialSetCount: entry.initialSetCount,
        reps: entry.reps,
        startingWeight: entry.startingWeight,
        weightUnit: entry.weightUnit,
      },
    };
    setSelections(nextSelections);
    moveForward(nextSelections);
  };

  const skip = () => {
    const nextSelections = { ...selections };
    delete nextSelections[currentIndex];
    setSelections(nextSelections);
    moveForward(nextSelections);
  };

  const selectedExerciseId = selections[currentIndex]?.id;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onDismiss}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onDismiss} />
        <View style={[styles.sheet, {
          backgroundColor: colors.background,
          borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
        }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Choose Exercise</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Closest matches for “{entry.sourceName}”</Text>
          <ScrollView style={styles.matches}>
            {entry.matches.length > 0 ? entry.matches.map((match) => {
              const image = getCachedExerciseImageSource(match.images?.[0]);
              const isSelected = match.id === selectedExerciseId;
              return (
                <Pressable
                  key={match.id}
                  onPress={() => selectExercise(match.id, match.name)}
                  style={[styles.option, {
                    borderColor: isSelected ? colors.accent : colors.border,
                    backgroundColor: isSelected ? colors.accentOverlay : 'transparent',
                  }]}
                >
                  {image ? <Image source={image} style={styles.image} resizeMode="cover" /> : (
                    <View style={[styles.image, styles.imageFallback, { backgroundColor: colors.accentOverlay }]}>
                      <Text style={{ color: colors.accent }}>?</Text>
                    </View>
                  )}
                  <View style={styles.copy}>
                    <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>{match.name}</Text>
                    <Text style={{ color: colors.textSecondary }}>{entry.initialSetCount} sets × {entry.reps} reps</Text>
                    <Text style={[styles.choose, { color: colors.accent }]}>{isSelected ? 'Selected' : 'Select this exercise'}</Text>
                  </View>
                </Pressable>
              );
            }) : (
              <Text style={[styles.noMatches, { color: colors.textSecondary }]}>No related exercises found. Skip this item or edit its name and import again.</Text>
            )}
          </ScrollView>
          <View style={styles.actions}>
            <Pressable
              disabled={currentIndex === 0}
              onPress={() => setCurrentIndex((index) => Math.max(0, index - 1))}
              style={[styles.action, { borderColor: colors.accentBorder }, currentIndex === 0 && styles.actionDisabled]}
            >
              <Text style={{ color: currentIndex === 0 ? colors.textTertiary : colors.accent }}>Previous</Text>
            </Pressable>
            <Pressable onPress={skip} style={[styles.action, { borderColor: colors.accentBorder }]}>
              <Text style={{ color: colors.accent }}>Next</Text>
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
  sheet: { height: '72%', borderTopLeftRadius: 20, borderTopRightRadius: 20, borderTopWidth: 1, padding: Spacing.xl, gap: Spacing.md },
  title: { fontFamily: 'BankGothicBT-Medium', fontSize: 22, fontWeight: '800', textTransform: 'uppercase', textAlign: 'center' },
  subtitle: { textAlign: 'center' },
  matches: { flex: 1 },
  option: { borderWidth: 1, borderRadius: BorderRadius.md, padding: Spacing.sm, marginBottom: Spacing.sm, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  image: { width: 78, height: 78, borderRadius: BorderRadius.sm },
  imageFallback: { alignItems: 'center', justifyContent: 'center' },
  copy: { gap: 5, flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: '700' },
  choose: { fontSize: 13, fontWeight: '700' },
  noMatches: { textAlign: 'center', paddingVertical: Spacing.xl },
  actions: { flexDirection: 'row', gap: Spacing.md },
  action: { flex: 1, borderWidth: 1, borderRadius: BorderRadius.md, padding: Spacing.md, alignItems: 'center' },
  actionDisabled: { opacity: 0.5 },
});
