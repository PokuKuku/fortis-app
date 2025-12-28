import React, { useMemo, useState } from 'react';
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
import { X, Dumbbell } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '../../../constants/Colors';
import { IconSizes } from '../../../constants/Sizes';
import { useExercises } from '../../hooks/useExercises';
import { styles } from './AIMutationPreviewModal.styles';

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
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const { exercises, loading, error } = useExercises();

  const sortedExercises = useMemo(() => {
    return [...exercises].sort((a, b) => a.name.localeCompare(b.name));
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return sortedExercises.slice(0, 50);
    }

    return sortedExercises.filter((exercise) =>
      exercise.name.toLowerCase().includes(query)
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
          style={styles.pickerContainer}
        >
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Choose exercise</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X color={colors.textSecondary} size={IconSizes.md} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <ScrollView
            style={styles.exerciseList}
            contentContainerStyle={styles.exerciseListContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {loading && (
              <View style={styles.loadingState}>
                <ActivityIndicator color={colors.accent} size="small" />
                <Text style={styles.loadingText}>Loading exercises...</Text>
              </View>
            )}
            {!loading && error && (
              <Text style={styles.noResultsText}>
                Unable to load exercises. Please check your connection.
              </Text>
            )}
            {!loading && !error && filteredExercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={styles.exerciseOption}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
                  onSelect(exercise.id, exercise.name);
                  setSearchQuery('');
                }}
              >
                <Dumbbell color={colors.textSecondary} size={IconSizes.sm} />
                <Text style={styles.exerciseOptionText}>{exercise.name}</Text>
              </TouchableOpacity>
            ))}
            {!loading && !error && filteredExercises.length === 0 && (
              <Text style={styles.noResultsText}>No exercises found</Text>
            )}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
