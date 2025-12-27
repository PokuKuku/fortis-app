import React from 'react';
import { View, Text } from 'react-native';
import { AlertTriangle, Edit2, Plus, Trash2, Info } from 'lucide-react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '../../../constants/Colors';
import { IconSizes } from '../../../constants/Sizes';
import { AIMutation, AIExerciseResolution } from '../../types/ai';
import { styles } from './AIMutationPreviewModal.styles';

interface AIMutationSummaryListProps {
  newExercises: AIExerciseResolution[];
  exerciseResolution: AIExerciseResolution[];
  mutations: AIMutation[];
}

const OPERATION_ICONS = {
  INSERT: Plus,
  UPDATE: Edit2,
  DELETE: Trash2,
};

const OPERATION_COLORS = {
  INSERT: Colors.success,
  UPDATE: Colors.warning,
  DELETE: Colors.error,
};

export function AIMutationSummaryList({
  newExercises,
  exerciseResolution,
  mutations,
}: AIMutationSummaryListProps) {
  const { colors } = useTheme();

  const renderMutation = (mutation: AIMutation) => {
    const Icon = OPERATION_ICONS[mutation.operation];
    const color = OPERATION_COLORS[mutation.operation];

    return (
      <View key={mutation.mutationId} style={styles.mutationItem}>
        <View style={[styles.mutationIcon, { backgroundColor: `${color}20` }]}>
          <Icon color={color} size={IconSizes.sm} />
        </View>
        <View style={styles.mutationContent}>
          <Text style={styles.mutationDescription}>{mutation.description}</Text>
          <Text style={styles.mutationMeta}>
            {mutation.operation} {mutation.entityType.replace('_', ' ')}
          </Text>
        </View>
      </View>
    );
  };

  const renderExerciseResolution = (exercise: AIExerciseResolution) => {
    if (exercise.fromHistory) return null;

    return (
      <View key={exercise.exerciseId} style={styles.newExercise}>
        <View style={styles.newExerciseHeader}>
          <AlertTriangle color={Colors.warning} size={IconSizes.sm} />
          <Text style={styles.newExerciseTitle}>New: {exercise.exerciseName}</Text>
        </View>
        {exercise.justification && (
          <Text style={styles.newExerciseJustification}>
            {exercise.justification}
          </Text>
        )}
        {exercise.explanation && (
          <View style={styles.newExerciseExplanation}>
            <Info color={colors.textTertiary} size={12} />
            <Text style={styles.newExerciseExplanationText}>
              {exercise.explanation}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      {/* New Exercises Warning */}
      {newExercises.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            New Exercises ({newExercises.length})
          </Text>
          {exerciseResolution.map(renderExerciseResolution)}
        </View>
      )}

      {/* Mutations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Changes ({mutations.length})
        </Text>
        {mutations.map(renderMutation)}
      </View>
    </>
  );
}
