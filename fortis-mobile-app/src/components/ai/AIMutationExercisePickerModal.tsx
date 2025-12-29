import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { X, Search, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { DumbbellIcon } from '../icons/DumbbellIcon';
import { useTheme } from '@/src/contexts/ThemeContext';
import { IconSizes, Spacing } from '../../../constants/Sizes';
import { useExercises } from '../../hooks/useExercises';
import { styles, getThemedStyles } from './AIMutationPreviewModal.styles';

interface AIMutationExercisePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (exerciseId: string, exerciseName: string) => void;
}

export function AIMutationExercisePickerModal({
  visible,
  onClose,
  onSelect,
}: AIMutationExercisePickerModalProps) {
  const { colors, isDark } = useTheme();
  const themedStyles = getThemedStyles(colors, isDark);
  const [searchQuery, setSearchQuery] = useState('');
  const { exercises, loading, error, refresh } = useExercises();

  // Reset search when modal opens
  useEffect(() => {
    if (visible) {
      setSearchQuery('');
    }
  }, [visible]);

  const sortedExercises = useMemo(() => {
    return [...exercises].sort((a, b) => a.name.localeCompare(b.name));
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      // Show first 100 exercises when no search query
      return sortedExercises.slice(0, 100);
    }

    return sortedExercises.filter((exercise) =>
      exercise.name.toLowerCase().includes(query) ||
      exercise.primaryMuscles?.some(m => m.toLowerCase().includes(query)) ||
      exercise.equipment?.toLowerCase().includes(query)
    );
  }, [searchQuery, sortedExercises]);

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={onClose}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={styles.pickerOverlay}
      >
        <Animated.View
          entering={ZoomIn.duration(200)}
          exiting={ZoomOut.duration(150)}
          style={[styles.pickerContainer, themedStyles.pickerContainer, { minHeight: 400 }]}
        >
          <View style={[styles.pickerHeader, themedStyles.pickerHeader]}>
            <Text style={[styles.pickerTitle, themedStyles.pickerTitle]}>Choose exercise</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X color={colors.textSecondary} size={IconSizes.md} />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchContainer, themedStyles.searchContainer]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
              <Search color={colors.textTertiary} size={IconSizes.sm} />
              <TextInput
                style={[styles.searchInput, themedStyles.searchInput, { flex: 1 }]}
                placeholder="Search by name, muscle, or equipment..."
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <ScrollView
            style={[styles.exercisePickerList, { minHeight: 250 }]}
            contentContainerStyle={[styles.exercisePickerContent, { flexGrow: 1 }]}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            {loading && (
              <View style={[styles.loadingState, { paddingVertical: Spacing['3xl'] }]}>
                <ActivityIndicator color={colors.accent} size="large" />
                <Text style={[styles.loadingText, themedStyles.loadingText]}>Loading exercises...</Text>
              </View>
            )}

            {!loading && error && (
              <View style={[styles.loadingState, { paddingVertical: Spacing['3xl'] }]}>
                <AlertCircle color={colors.textTertiary} size={32} />
                <Text style={[styles.noResultsText, themedStyles.noResultsText]}>
                  Unable to load exercises
                </Text>
                <TouchableOpacity
                  onPress={refresh}
                  style={{
                    marginTop: Spacing.md,
                    paddingHorizontal: Spacing.lg,
                    paddingVertical: Spacing.sm,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: colors.accent }}>Tap to retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {!loading && !error && exercises.length === 0 && (
              <View style={[styles.loadingState, { paddingVertical: Spacing['3xl'] }]}>
                <DumbbellIcon color={colors.textTertiary} size={32} />
                <Text style={[styles.noResultsText, themedStyles.noResultsText]}>
                  No exercises available
                </Text>
                <Text style={[styles.noResultsText, themedStyles.noResultsText, { fontSize: 13 }]}>
                  Check your internet connection
                </Text>
              </View>
            )}

            {!loading && !error && exercises.length > 0 && filteredExercises.length === 0 && (
              <View style={[styles.loadingState, { paddingVertical: Spacing['3xl'] }]}>
                <Search color={colors.textTertiary} size={32} />
                <Text style={[styles.noResultsText, themedStyles.noResultsText]}>
                  No exercises match "{searchQuery}"
                </Text>
              </View>
            )}

            {!loading && !error && filteredExercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={[
                  styles.exerciseOption,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                    marginBottom: Spacing.xs,
                    borderRadius: 8,
                  }
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
                  onSelect(exercise.id, exercise.name);
                  setSearchQuery('');
                }}
                activeOpacity={0.7}
              >
                <DumbbellIcon color={colors.accent} size={IconSizes.sm} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.exerciseOptionText, themedStyles.exerciseOptionText]}>{exercise.name}</Text>
                  {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 && (
                    <Text style={{ color: colors.textTertiary, fontSize: 12 }}>
                      {exercise.primaryMuscles.slice(0, 2).join(', ')}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Exercise count footer */}
          {!loading && !error && exercises.length > 0 && (
            <View style={{
              paddingHorizontal: Spacing.lg,
              paddingVertical: Spacing.sm,
              borderTopWidth: 1,
              borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            }}>
              <Text style={{ color: colors.textTertiary, fontSize: 12, textAlign: 'center' }}>
                {filteredExercises.length} of {exercises.length} exercises
              </Text>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
