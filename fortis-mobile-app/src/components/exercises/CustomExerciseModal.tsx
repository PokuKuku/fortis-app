import { useMemo, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  DeviceEventEmitter,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useExercises } from '@/src/hooks/useExercises';
import { saveCustomExercise } from '@/src/services/exerciseService';
import { buildExerciseSearchIndex, searchExercises as searchExercisesInIndex } from '@/src/utils/exerciseSearch';
import { ACTIVE_MUSCLE_KEYS, getMuscleDisplayName, type MuscleKey } from '@/src/utils/muscleTaxonomy';
import { CATEGORIES, EQUIPMENT_TYPES } from '@/src/constants/exerciseOptions';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import type { Exercise } from '@/src/types/exercise';

type CustomExerciseModalProps = {
  visible: boolean;
  onClose: () => void;
  initialExercise?: Exercise | null;
};

export function CustomExerciseModal({
  visible,
  onClose,
  initialExercise,
}: CustomExerciseModalProps) {
  const { colors, isDark } = useTheme();
  const { exercises: allExercises } = useExercises();
  const [exerciseName, setExerciseName] = useState('');
  const [primaryMuscle, setPrimaryMuscle] = useState('');
  const [secondaryMuscles, setSecondaryMuscles] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [equipment, setEquipment] = useState('');
  const [instructions, setInstructions] = useState('');
  const [basedOnQuery, setBasedOnQuery] = useState('');
  const [basedOnExerciseId, setBasedOnExerciseId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState({
    name: false,
    primary: false,
  });
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const nameShake = useRef(new Animated.Value(0)).current;
  const primaryShake = useRef(new Animated.Value(0)).current;

  const canonicalExercises = useMemo(
    () => allExercises.filter((exercise) =>
      exercise.source !== 'custom' &&
      !exercise.canonicalId &&
      !exercise.isHidden &&
      exercise.isCurated
    ),
    [allExercises]
  );

  const basedOnSearchIndex = useMemo(
    () => buildExerciseSearchIndex(canonicalExercises),
    [canonicalExercises]
  );

  const basedOnResults = useMemo(() => {
    if (!basedOnQuery.trim()) return [];
    return searchExercisesInIndex(basedOnQuery, basedOnSearchIndex, {
      includeInstructions: false,
    }).slice(0, 8);
  }, [basedOnQuery, basedOnSearchIndex]);

  const basedOnSelection = useMemo(
    () => canonicalExercises.find((exercise) => exercise.id === basedOnExerciseId) ?? null,
    [canonicalExercises, basedOnExerciseId]
  );

  const optionList = {
    primaryMuscles: [...ACTIVE_MUSCLE_KEYS],
    categories: [...CATEGORIES],
    equipmentTypes: [...EQUIPMENT_TYPES],
  };

  const resetExerciseForm = () => {
    setExerciseName('');
    setPrimaryMuscle('');
    setSecondaryMuscles([]);
    setCategory('');
    setEquipment('');
    setInstructions('');
    setBasedOnQuery('');
    setBasedOnExerciseId(null);
    setEditingExerciseId(null);
  };

  useEffect(() => {
    if (!visible) {
      resetExerciseForm();
      setFieldErrors({ name: false, primary: false });
      return;
    }

    if (initialExercise) {
      setExerciseName(initialExercise.name ?? '');
      setCategory(initialExercise.category ?? '');
      setPrimaryMuscle(initialExercise.primaryMuscles?.[0] ?? '');
      setSecondaryMuscles(initialExercise.secondaryMuscles?.slice(0, 3) ?? []);
      setEquipment(initialExercise.equipment ?? '');
      setInstructions(
        Array.isArray(initialExercise.instructions)
          ? initialExercise.instructions.join('\n')
          : initialExercise.instructions ?? ''
      );
      setBasedOnExerciseId(initialExercise.basedOnExerciseId ?? null);
      setBasedOnQuery('');
      setEditingExerciseId(initialExercise.id ?? null);
      setFieldErrors({ name: false, primary: false });
      return;
    }

    resetExerciseForm();
    setFieldErrors({ name: false, primary: false });
  }, [initialExercise, visible]);

  const shakeStyle = (anim: Animated.Value) => ({
    transform: [
      {
        translateX: anim.interpolate({
          inputRange: [-1, 1],
          outputRange: [-6, 6],
        }),
      },
    ],
  });

  const handleSaveExercise = async () => {
    const missing = {
      name: !exerciseName.trim(),
      primary: !primaryMuscle,
    };
    setFieldErrors(missing);

    const triggerShake = (anim: Animated.Value) => {
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(anim, { toValue: -1, duration: 50, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    };

    if (missing.name || missing.primary) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
      if (missing.name) triggerShake(nameShake);
      if (missing.primary) triggerShake(primaryShake);
      return;
    }

    const instructionList = instructions
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const newExercise: Exercise = {
      id: editingExerciseId ?? `custom-${Date.now()}`,
      name: exerciseName.trim(),
      primaryMuscles: [primaryMuscle],
      secondaryMuscles: secondaryMuscles,
      equipment: equipment || 'Bodyweight',
      category: category || 'Strength',
      instructions: instructionList,
      images: [],
      basedOnExerciseId: basedOnExerciseId ?? null,
    };

    try {
      await saveCustomExercise(newExercise);
      DeviceEventEmitter.emit('customExerciseUpsert', newExercise);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      onClose();
      resetExerciseForm();
    } catch (err) {
      console.warn('Failed to save custom exercise', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
    }
  };

  if (!visible) {
    return null;
  }

  const themedStyles = {
    modalOverlay: { backgroundColor: colors.overlayHeavy },
    modalCard: {
      backgroundColor: isDark ? '#222222' : '#FFFFFF',
      borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
    },
    modalTitle: { color: colors.textPrimary },
    inputLabel: { color: colors.textSecondary },
    textInput: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
      color: colors.textPrimary,
    },
    basedOnSelectedRow: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
      borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
    },
    basedOnSelectedText: { color: colors.textPrimary },
    basedOnClear: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    },
    basedOnClearText: { color: colors.textSecondary },
    basedOnResults: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    },
    basedOnResultText: { color: colors.textPrimary },
    basedOnResultMeta: { color: colors.textTertiary },
    basedOnEmpty: { color: colors.textTertiary },
    basedOnResultRow: {
      borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    },
    chip: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
    },
    chipActive: {
      backgroundColor: colors.accentOverlay,
      borderColor: colors.accent,
    },
    chipText: { color: colors.textSecondary },
    chipTextActive: { color: colors.accent },
    modalCancel: {
      borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    },
    modalSave: {
      borderColor: colors.accent,
      backgroundColor: colors.accentOverlay,
    },
    modalCancelText: { color: colors.textSecondary },
    modalSaveText: { color: colors.accent },
    importButton: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
      borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
    },
    importButtonText: { color: colors.textTertiary },
    invalidInput: {
      backgroundColor: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)',
    },
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={[styles.modalOverlay, themedStyles.modalOverlay]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => {
            onClose();
            resetExerciseForm();
          }}
        />
        <View style={[styles.modalCard, themedStyles.modalCard]}>
          <Text style={[styles.modalTitle, themedStyles.modalTitle]}>Add Custom Exercise</Text>
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.inputLabel, themedStyles.inputLabel]}>Name *</Text>
            <Animated.View style={shakeStyle(nameShake)}>
              <TextInput
                style={[
                  styles.textInput,
                  themedStyles.textInput,
                  styles.textInputSingle,
                  fieldErrors.name && styles.invalidInput,
                  fieldErrors.name && themedStyles.invalidInput,
                ]}
                placeholder="e.g. Single Arm Cable Row"
                placeholderTextColor={colors.textTertiary}
                value={exerciseName}
                onChangeText={(value) => {
                  setExerciseName(value);
                  if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: false }));
                }}
              />
            </Animated.View>

            <Text style={[styles.inputLabel, themedStyles.inputLabel]}>Category (optional)</Text>
            <View style={styles.chipWrap}>
              {optionList.categories.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.chip,
                    themedStyles.chip,
                    category === item && themedStyles.chipActive,
                  ]}
                  onPress={() => setCategory(item === category ? '' : item)}
                >
                  <Text style={[
                    styles.chipText,
                    themedStyles.chipText,
                    category === item && themedStyles.chipTextActive,
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.inputLabel, themedStyles.inputLabel]}>Primary Muscle *</Text>
            <Animated.View style={shakeStyle(primaryShake)}>
              <View style={styles.chipWrap}>
                {optionList.primaryMuscles.map((item) => (
                  <TouchableOpacity
                    key={item}
                      style={[
                        styles.chip,
                        themedStyles.chip,
                        primaryMuscle === item && themedStyles.chipActive,
                        fieldErrors.primary && styles.invalidChip,
                      ]}
                    onPress={() => {
                      setPrimaryMuscle(item);
                      if (fieldErrors.primary) setFieldErrors(prev => ({ ...prev, primary: false }));
                    }}
                  >
                    <Text style={[
                      styles.chipText,
                      themedStyles.chipText,
                      primaryMuscle === item && themedStyles.chipTextActive,
                    ]}>
                      {getMuscleDisplayName(item as MuscleKey)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            <Text style={[styles.inputLabel, themedStyles.inputLabel]}>
              Secondary Muscles (optional, up to 3){secondaryMuscles.length > 0 ? ` — ${secondaryMuscles.length}/3` : ''}
            </Text>
            <View style={styles.chipWrap}>
              {optionList.primaryMuscles.map((item) => {
                const isSelected = secondaryMuscles.includes(item);
                const isDisabled = !isSelected && secondaryMuscles.length >= 3;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.chip,
                      themedStyles.chip,
                      isSelected && themedStyles.chipActive,
                      isDisabled && styles.chipDisabled,
                    ]}
                    onPress={() => {
                      if (isSelected) {
                        setSecondaryMuscles(secondaryMuscles.filter(m => m !== item));
                      } else if (secondaryMuscles.length < 3) {
                        setSecondaryMuscles([...secondaryMuscles, item]);
                      }
                    }}
                    disabled={isDisabled}
                  >
                    <Text style={[
                      styles.chipText,
                      themedStyles.chipText,
                      isSelected && themedStyles.chipTextActive,
                      isDisabled && styles.chipTextDisabled,
                    ]}>
                      {getMuscleDisplayName(item as MuscleKey)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.inputLabel, themedStyles.inputLabel]}>Equipment (optional)</Text>
            <View style={styles.chipWrap}>
              {optionList.equipmentTypes.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.chip,
                    themedStyles.chip,
                    equipment === item && themedStyles.chipActive,
                  ]}
                  onPress={() => setEquipment(item === equipment ? '' : item)}
                >
                  <Text style={[
                    styles.chipText,
                    themedStyles.chipText,
                    equipment === item && themedStyles.chipTextActive,
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.inputLabel, themedStyles.inputLabel]}>Based on (optional)</Text>
            <View style={styles.basedOnContainer}>
              {basedOnSelection && (
                <View style={[styles.basedOnSelectedRow, themedStyles.basedOnSelectedRow]}>
                  <Text style={[styles.basedOnSelectedText, themedStyles.basedOnSelectedText]} numberOfLines={1}>
                    {basedOnSelection.name}
                  </Text>
                  <TouchableOpacity
                    style={[styles.basedOnClear, themedStyles.basedOnClear]}
                    onPress={() => setBasedOnExerciseId(null)}
                  >
                    <Text style={[styles.basedOnClearText, themedStyles.basedOnClearText]}>Clear</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TextInput
                style={[styles.textInput, themedStyles.textInput]}
                placeholder="Search a canonical exercise..."
                placeholderTextColor={colors.textTertiary}
                value={basedOnQuery}
                onChangeText={setBasedOnQuery}
              />
              {basedOnQuery.trim().length > 0 && (
                <View style={[styles.basedOnResults, themedStyles.basedOnResults]}>
                  {basedOnResults.length === 0 ? (
                    <Text style={[styles.basedOnEmpty, themedStyles.basedOnEmpty]}>No matches</Text>
                  ) : (
                    basedOnResults.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.basedOnResultRow, themedStyles.basedOnResultRow]}
                        onPress={() => {
                          setBasedOnExerciseId(item.id);
                          setBasedOnQuery('');
                          if (!primaryMuscle && item.primaryMuscles?.[0]) {
                            setPrimaryMuscle(item.primaryMuscles[0]);
                          }
                          if (secondaryMuscles.length === 0 && item.secondaryMuscles?.length) {
                            setSecondaryMuscles(item.secondaryMuscles.slice(0, 3));
                          }
                          if (!equipment && item.equipment) {
                            setEquipment(item.equipment);
                          }
                          if (!category && item.category) {
                            const match = optionList.categories.find(
                              (entry) => entry.toLowerCase() === item.category.toLowerCase()
                            );
                            if (match) setCategory(match);
                          }
                        }}
                      >
                        <Text style={[styles.basedOnResultText, themedStyles.basedOnResultText]} numberOfLines={1}>
                          {item.name}
                        </Text>
                        {item.primaryMuscles?.length ? (
                          <Text style={[styles.basedOnResultMeta, themedStyles.basedOnResultMeta]}>
                            {getMuscleDisplayName(item.primaryMuscles[0] as MuscleKey)}
                          </Text>
                        ) : null}
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </View>

            <Text style={[styles.inputLabel, themedStyles.inputLabel]}>Instructions (optional)</Text>
            <TextInput
              style={[styles.textInput, themedStyles.textInput, styles.instructionsInput]}
              placeholder="Step-by-step cues"
              placeholderTextColor={colors.textTertiary}
              multiline
              value={instructions}
              onChangeText={setInstructions}
            />

            <TouchableOpacity
              style={[styles.importButton, themedStyles.importButton]}
              activeOpacity={0.8}
            >
              <Text style={[styles.importButtonText, themedStyles.importButtonText]}>
                Import Image (coming soon)
              </Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalActionButton, themedStyles.modalCancel]}
              onPress={() => {
                onClose();
                resetExerciseForm();
              }}
            >
              <Text style={[styles.modalCancelText, themedStyles.modalCancelText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalActionButton, themedStyles.modalSave]}
              onPress={handleSaveExercise}
            >
              <Text style={[styles.modalSaveText, themedStyles.modalSaveText]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalScroll: {
    maxHeight: 500,
  },
  modalScrollContent: {
    paddingBottom: 12,
    gap: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  textInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  textInputSingle: {
    height: Sizes.minTouchTarget,
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  instructionsInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  basedOnContainer: {
    gap: 8,
  },
  basedOnSelectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  basedOnSelectedText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  basedOnClear: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  basedOnClearText: {
    fontSize: 12,
    fontWeight: '600',
  },
  basedOnResults: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  basedOnResultRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  basedOnResultText: {
    fontSize: 14,
    fontWeight: '600',
  },
  basedOnResultMeta: {
    fontSize: 12,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  basedOnEmpty: {
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipDisabled: {
    opacity: 0.4,
  },
  chipTextDisabled: {
    opacity: 0.6,
  },
  invalidInput: {
    borderColor: Colors.error,
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  invalidChip: {
    borderColor: Colors.error,
  },
  importButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  importButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  modalActionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalCancelText: {
    fontWeight: '700',
  },
  modalSaveText: {
    fontWeight: '800',
  },
});
