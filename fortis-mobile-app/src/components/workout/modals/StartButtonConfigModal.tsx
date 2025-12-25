import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import {
  CheckIcon,
  PlayIcon,
  Squares2X2Icon,
  CalendarDaysIcon,
  XMarkIcon,
} from 'react-native-heroicons/outline';
import { BaseModal, modalStyles } from '@/src/components/ui/BaseModal';
import { Colors } from '@/constants/Colors';
import { BorderRadius, FontSizes, Spacing } from '@/constants/Sizes';
import type { StartPreset } from '@/src/store/startPresetStore';
import type { Program } from '@/src/types/workout';

interface StartButtonConfigModalProps {
  visible: boolean;
  currentPreset: StartPreset | null;
  templates: Program[];
  programs: Program[];
  isLoading: boolean;
  onSelect: (preset: StartPreset) => void;
  onUnset: () => void;
  onClose: () => void;
  currentLabel?: string;
}

export function StartButtonConfigModal({
  visible,
  currentPreset,
  templates,
  programs,
  isLoading,
  onSelect,
  onUnset,
  onClose,
  currentLabel,
}: StartButtonConfigModalProps) {
  const renderOption = (props: {
    label: string;
    subtitle?: string;
    selected?: boolean;
    icon?: React.ReactNode;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={props.onPress}
      style={({ pressed }) => [
        styles.option,
        props.selected && styles.optionSelected,
        pressed && styles.optionPressed,
      ]}
    >
      <View style={styles.optionContent}>
        {props.icon && <View style={styles.optionIcon}>{props.icon}</View>}
        <View style={styles.optionText}>
          <Text style={styles.optionLabel}>{props.label}</Text>
          {props.subtitle ? (
            <Text style={styles.optionSubtitle}>{props.subtitle}</Text>
          ) : null}
        </View>
      </View>
      {props.selected && <CheckIcon size={18} color={Colors.success} strokeWidth={2} />}
    </Pressable>
  );

  const presetLabel = currentLabel || (currentPreset ? 'Selected' : 'Not set');

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Start Button"
      icon={<PlayIcon size={24} color={Colors.success} strokeWidth={2} />}
    >
      <Text style={modalStyles.message}>
        {currentPreset
          ? `Currently set to ${presetLabel}.`
          : 'Choose what the Start button should launch.'}
      </Text>

      {currentPreset && (
        <Pressable
          onPress={onUnset}
          style={({ pressed }) => [
            styles.unsetButton,
            pressed && modalStyles.buttonPressed,
          ]}
        >
          <XMarkIcon size={16} color={Colors.error} strokeWidth={2} />
          <Text style={styles.unsetText}>Unset Start Button</Text>
        </Pressable>
      )}

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <Text style={styles.sectionTitle}>Blank Workout</Text>
        {renderOption({
          label: 'Blank Workout',
          subtitle: 'Start a fresh workout log',
          selected: currentPreset?.type === 'blank',
          icon: <PlayIcon size={18} color={Colors.textPrimary} strokeWidth={2} />,
          onPress: () => onSelect({ type: 'blank' }),
        })}

        <Text style={styles.sectionTitle}>Workouts</Text>
        {isLoading && templates.length === 0 ? (
          <Text style={styles.emptyText}>Loading workouts...</Text>
        ) : templates.length === 0 ? (
          <Text style={styles.emptyText}>No saved workouts yet.</Text>
        ) : (
          templates.map((template) =>
            renderOption({
              label: template.name,
              subtitle: 'Saved workout template',
              selected:
                currentPreset?.type === 'template' &&
                (currentPreset.templateId === template.id ||
                  template.workouts.some((w) => w.id === currentPreset.templateWorkoutId)),
              icon: <Squares2X2Icon size={18} color={Colors.textPrimary} strokeWidth={2} />,
              onPress: () =>
                onSelect({
                  type: 'template',
                  templateId: template.id,
                  templateWorkoutId: template.workouts[0]?.id,
                }),
            })
          )
        )}

        <Text style={styles.sectionTitle}>Programs</Text>
        {isLoading && programs.length === 0 ? (
          <Text style={styles.emptyText}>Loading programs...</Text>
        ) : programs.length === 0 ? (
          <Text style={styles.emptyText}>No programs created yet.</Text>
        ) : (
          programs.map((program) =>
            renderOption({
              label: program.name,
              subtitle: 'Continue to the next workout',
              selected: currentPreset?.type === 'program' && currentPreset.programId === program.id,
              icon: <CalendarDaysIcon size={18} color={Colors.textPrimary} strokeWidth={2} />,
              onPress: () => onSelect({ type: 'program', programId: program.id }),
            })
          )
        )}
      </ScrollView>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  list: {
    maxHeight: 360,
  },
  listContent: {
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  option: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionSelected: {
    borderColor: Colors.success,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
  },
  optionPressed: {
    opacity: 0.8,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  optionIcon: {
    width: 28,
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  optionSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  emptyText: {
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
    marginBottom: Spacing.md,
  },
  unsetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.errorOverlay,
    marginBottom: Spacing.md,
  },
  unsetText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.error,
  },
});
