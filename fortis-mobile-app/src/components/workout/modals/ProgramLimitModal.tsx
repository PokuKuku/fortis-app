/**
 * ProgramLimitModal
 *
 * Warning modal shown when trying to add more than 7 workouts to a program.
 * Uses BaseModal for consistent styling.
 */
import React from 'react';
import { Text, Pressable } from 'react-native';
import { ExclamationTriangleIcon } from 'react-native-heroicons/outline';
import { BaseModal, modalStyles } from '@/src/components/ui/BaseModal';

interface ProgramLimitModalProps {
  visible: boolean;
  programName: string;
  onClose: () => void;
}

export function ProgramLimitModal({
  visible,
  programName,
  onClose,
}: ProgramLimitModalProps) {
  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Program Limit Reached"
      icon={<ExclamationTriangleIcon size={24} color="#f59e0b" />}
    >
      <Text style={modalStyles.message}>
        "{programName}" already has 7 workouts, which is the maximum allowed. To add a new workout, please remove an existing one first.
      </Text>
      <Pressable
        onPress={onClose}
        style={({ pressed }) => [
          modalStyles.warningButton,
          pressed && modalStyles.buttonPressed,
        ]}
      >
        <Text style={modalStyles.warningButtonText}>Got it</Text>
      </Pressable>
    </BaseModal>
  );
}
