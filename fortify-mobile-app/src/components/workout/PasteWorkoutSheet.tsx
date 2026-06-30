import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  InteractionManager,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { InformationCircleIcon } from 'react-native-heroicons/outline';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useExercises } from '@/src/hooks/useExercises';
import { buildExerciseSearchIndex, searchExercisesWithScores } from '@/src/utils/exerciseSearch';
import type { ExerciseWithSource } from '@/src/types/exercise';
import { parsePastedWorkout } from '@/src/utils/pasteWorkoutParser';
import { useTheme } from '@/src/contexts/ThemeContext';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { TourOverlay, type AnchorRect } from '@/src/components/tour/TourOverlay';
import Reanimated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';

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

export const TOUR_PASTE_WORKOUT_EXAMPLE = `Upper Body Demo

Barbell Bench Press: 3 sets x 8-12 reps
Cable Pulldown: 3 sets x 10-12 reps
Dumbbell Seated Shoulder Press: 3 sets x 10-12 reps`;

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
  tourExampleText,
  onTourExampleImported,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (entries: ImportedExercise[], workoutName: string | null) => void;
  onResolve: (entries: UnresolvedPastedExercise[]) => void;
  tourExampleText?: string;
  onTourExampleImported?: () => void;
}) {
  const { colors, isDark } = useTheme();
  const { exercises } = useExercises();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showFormatHelp, setShowFormatHelp] = useState(false);
  const makeTemplateButtonRef = useRef<View>(null);
  const tourInputRef = useRef<View>(null);
  const [makeTemplateButtonRect, setMakeTemplateButtonRect] = useState<AnchorRect | null>(null);
  const [tourInputRect, setTourInputRect] = useState<AnchorRect | null>(null);
  const sheetTranslateY = useRef(new Animated.Value(0)).current;
  const index = useMemo(() => buildExerciseSearchIndex(exercises), [exercises]);
  const isTourExample = Boolean(tourExampleText);

  const paste = async () => {
    setText(await Clipboard.getStringAsync());
    setError(null);
  };

  const importWorkout = useCallback((isTourImport = false) => {
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
      setError('no_entries_found');
      return false;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (imported.length > 0 || parsed.workoutName) onAdd(imported, parsed.workoutName);
    if (unresolved.length > 0) onResolve(unresolved);
    onClose();
    if (isTourImport) onTourExampleImported?.();
    return true;
  }, [exercises, index, onAdd, onClose, onResolve, onTourExampleImported, text]);

  useEffect(() => {
    if (!visible || !tourExampleText) return;
    setText(tourExampleText);
    setError(null);
  }, [tourExampleText, visible]);

  const measureTourTargets = useCallback(() => {
    makeTemplateButtonRef.current?.measureInWindow((x, y, width, height) => {
      if (width > 0 && height > 0) {
        setMakeTemplateButtonRect({ x, y, width, height });
      }
    });
    tourInputRef.current?.measureInWindow((x, y, width, height) => {
      if (width > 0 && height > 0) {
        setTourInputRect({ x, y, width, height });
      }
    });
  }, []);

  useEffect(() => {
    if (!visible || !isTourExample) {
      setMakeTemplateButtonRect(null);
      setTourInputRect(null);
      return;
    }

    const interaction = InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(measureTourTargets);
    });
    const settleTimer = setTimeout(measureTourTargets, 360);

    return () => {
      interaction.cancel();
      clearTimeout(settleTimer);
    };
  }, [isTourExample, measureTourTargets, visible]);

  useLayoutEffect(() => {
    if (!visible || !isTourExample) {
      sheetTranslateY.setValue(0);
      return;
    }

    sheetTranslateY.setValue(480);
    const animation = Animated.timing(sheetTranslateY, {
      toValue: 0,
      duration: 260,
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished) requestAnimationFrame(measureTourTargets);
    });

    return () => animation.stop();
  }, [isTourExample, measureTourTargets, sheetTranslateY, visible]);

  return (
    <>
      <Modal
      visible={visible}
      transparent
      animationType={isTourExample ? 'none' : 'slide'}
      onRequestClose={isTourExample ? () => undefined : onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={isTourExample ? undefined : onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoider}
          pointerEvents="box-none"
        >
          <Animated.View style={[styles.sheet, {
            backgroundColor: colors.background,
            borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
          }, isTourExample && { transform: [{ translateY: sheetTranslateY }] }]}>
            <StainlessSteelPattern />
            <View style={[styles.handle, { backgroundColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }]} />
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>Paste Workout</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Paste workout format help"
                accessibilityHint="Shows supported workout note formats"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowFormatHelp(true);
                }}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.helpButton,
                  {
                    backgroundColor: colors.accentOverlay,
                    borderColor: colors.accentBorder,
                  },
                  pressed && styles.helpButtonPressed,
                ]}
              >
                <InformationCircleIcon color={colors.accent} size={20} strokeWidth={2} />
              </Pressable>
            </View>
            <View ref={tourInputRef} onLayout={measureTourTargets} pointerEvents={isTourExample ? 'none' : 'auto'}>
              <TextInput
                value={text}
                onChangeText={(value) => { setText(value); setError(null); }}
                multiline
                scrollEnabled
                numberOfLines={4}
                editable={!isTourExample}
                placeholder="Paste an exercise list or workout notes"
                placeholderTextColor={colors.textTertiary}
                style={[styles.input, {
                  color: colors.textPrimary,
                  borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                }]}
              />
            </View>
            {error === 'no_entries_found' ? (
              <View style={[
                styles.formatErrorCard,
                {
                  backgroundColor: colors.accentOverlay,
                  borderColor: colors.accentBorder,
                },
              ]}>
                <Text style={[styles.formatErrorTitle, { color: colors.textPrimary }]}>We couldn’t find any exercise entries.</Text>
                <Text style={[styles.formatErrorText, { color: colors.textSecondary }]}>Use one exercise per line, for example:</Text>
                <Text style={[styles.formatErrorExample, { color: colors.textPrimary }]}>Barbell Bench Press: 3 sets x 8-12 reps</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="View supported paste workout formats"
                  onPress={() => setShowFormatHelp(true)}
                  hitSlop={6}
                  style={({ pressed }) => [styles.formatErrorAction, pressed && styles.helpButtonPressed]}
                >
                  <Text style={[styles.formatErrorActionText, { color: colors.accent }]}>View formats</Text>
                </Pressable>
              </View>
            ) : null}
            {isTourExample ? (
              <View ref={makeTemplateButtonRef} onLayout={measureTourTargets}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Make template from example workout notes"
                  testID="paste-workout-tour-make-template"
                  onPress={() => importWorkout(true)}
                  style={({ pressed }) => [
                    styles.demoAction,
                    { backgroundColor: colors.accent },
                    pressed && styles.demoActionPressed,
                  ]}
                >
                  <Text style={[styles.demoActionText, { color: colors.accentForegroundOnFill }]}>Make Template</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.row}>
                <Pressable style={[styles.secondary, { borderColor: colors.accentBorder }]} onPress={() => void paste()}>
                  <Text style={[styles.secondaryText, { color: colors.accent }]}>Paste Clipboard</Text>
                </Pressable>
                <GlassButton style={styles.importButton} onPress={() => importWorkout()}>
                  <Text style={[styles.importText, { color: colors.accentForegroundOnFill }]}>Import Workout</Text>
                </GlassButton>
              </View>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
        {isTourExample ? (
          <TourOverlay
            visible
            mode="spotlight"
            anchorRect={makeTemplateButtonRect}
            secondaryAnchorRect={tourInputRect}
            body={'Here is an example workout note. Tap "Make Template" to turn it into a workout template.'}
            centerTooltip
            showArrow={false}
            showHighlight
          />
        ) : null}
      {showFormatHelp ? (
        <Reanimated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.helpOverlay}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowFormatHelp(false)} />
          <Reanimated.View
            entering={ZoomIn.duration(250)}
            exiting={ZoomOut.duration(200)}
            style={[
              styles.helpCard,
              {
                backgroundColor: colors.background,
                borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
              },
            ]}
          >
            <StainlessSteelPattern />
            <View style={styles.helpHeader}>
              <Text style={[styles.helpTitle, { color: colors.textPrimary }]}>Paste a Workout</Text>
            </View>
            <View style={styles.helpContent}>
              <Text style={[styles.helpText, { color: colors.textSecondary }]}>Paste one exercise per line. Choose either format:</Text>
              <View style={[
                styles.formatExample,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                },
              ]}>
                <Text style={[styles.formatExampleLabel, { color: colors.accent }]}>Quick list</Text>
                <Text style={[styles.formatExampleText, { color: colors.textPrimary }]}>Barbell Bench Press{`\n`}Cable Pulldown</Text>
                <Text style={[styles.formatExampleHint, { color: colors.textSecondary }]}>Each exercise will be created with 3 sets of 8–12 reps.</Text>
                <Text style={[styles.formatExampleLabel, { color: colors.accent }]}>Custom targets</Text>
                <Text style={[styles.formatExampleText, { color: colors.textPrimary }]}>Barbell Bench Press: 3 × 8–12 reps{`\n`}Goblet Squat: 4 × 10 @ 25 kg</Text>
              </View>
              <Text style={[styles.helpText, { color: colors.textSecondary }]}>Use x, ×, or “sets of.” Ranges can use - , – , or “to.” Add an optional weight after the reps.</Text>
              <Text style={[styles.helpText, { color: colors.textSecondary }]}>To add a workout name, put it on the first line, then leave a blank line before the exercises.</Text>
            </View>
          </Reanimated.View>
        </Reanimated.View>
      ) : null}
      </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject },
  keyboardAvoider: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl, gap: Spacing.lg, overflow: 'hidden' },
  handle: { width: 42, height: 4, borderRadius: 999, alignSelf: 'center', marginTop: Spacing.sm },
  header: { alignItems: 'center', justifyContent: 'center', minHeight: 36 },
  title: { fontSize: 24, fontFamily: 'BankGothicBT-Medium', fontWeight: '800', textTransform: 'uppercase', textAlign: 'center' },
  helpButton: { position: 'absolute', right: 0, width: 32, height: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  helpButtonPressed: { opacity: 0.7 },
  input: { height: 132, borderWidth: 1, borderRadius: BorderRadius.md, padding: Spacing.md, textAlignVertical: 'top', fontSize: 16 },
  formatErrorCard: { borderWidth: 1, borderRadius: BorderRadius.md, padding: Spacing.md, gap: Spacing.xs },
  formatErrorTitle: { fontSize: 14, fontWeight: '700' },
  formatErrorText: { fontSize: 13 },
  formatErrorExample: { fontSize: 13, fontFamily: 'BankGothicBT-Medium' },
  formatErrorAction: { alignSelf: 'flex-start', marginTop: Spacing.xs, minHeight: 28, justifyContent: 'center' },
  formatErrorActionText: { fontSize: 13, fontWeight: '700' },
  demoAction: { minHeight: 52, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  demoActionPressed: { opacity: 0.82 },
  demoActionText: { fontSize: 15, fontFamily: 'BankGothicBT-Medium', fontWeight: '800', textTransform: 'uppercase' },
  row: { flexDirection: 'row', gap: Spacing.md },
  secondary: { flex: 1, borderWidth: 1, borderRadius: BorderRadius.md, minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontSize: 15, fontFamily: 'BankGothicBT-Medium', fontWeight: '700' },
  importButton: { flex: 1, height: 52, borderRadius: BorderRadius.md },
  importText: { fontSize: 15, fontFamily: 'BankGothicBT-Medium', fontWeight: '800' },
  helpOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 20, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, backgroundColor: 'rgba(15, 23, 42, 0.55)' },
  helpCard: { width: '100%', maxWidth: 360, borderRadius: BorderRadius.xl, borderWidth: 1, padding: Spacing.lg, gap: Spacing.md, overflow: 'hidden' },
  helpHeader: { alignItems: 'center' },
  helpTitle: { fontSize: 20, fontFamily: 'BankGothicBT-Medium', fontWeight: '800', textTransform: 'uppercase', textAlign: 'center' },
  helpContent: { gap: Spacing.md },
  helpText: { fontSize: 14, lineHeight: 20 },
  formatExample: { borderWidth: 1, borderRadius: BorderRadius.md, padding: Spacing.md, gap: Spacing.xs },
  formatExampleLabel: { fontSize: 12, fontFamily: 'BankGothicBT-Medium', fontWeight: '800', textTransform: 'uppercase' },
  formatExampleText: { fontSize: 14, fontFamily: 'BankGothicBT-Medium' },
  formatExampleHint: { fontSize: 13, lineHeight: 18 },
});
