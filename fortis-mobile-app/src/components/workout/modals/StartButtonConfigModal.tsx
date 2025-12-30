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
import { useTheme } from '@/src/contexts/ThemeContext';
import type { StartPreset } from '@/src/store/startPresetStore';
import type { Program } from '@/src/types/workout';

interface StartButtonConfigModalProps {
  visible: boolean;
  currentPreset: StartPreset | null;
  draftPreset: StartPreset | null;
  templates: Program[];
  programs: Program[];
  isLoading: boolean;
  onChange: (preset: StartPreset | null) => void;
  onConfirm: () => void;
  onClose: () => void;
  currentLabel?: string;
}

export function StartButtonConfigModal({
  visible,
  currentPreset,
  draftPreset,
  templates,
  programs,
  isLoading,
  onChange,
  onConfirm,
  onClose,
  currentLabel,
}: StartButtonConfigModalProps) {
  const { colors, isDark } = useTheme();

  // Dynamic theme-aware styles
  const themedStyles = {
    sectionTitle: { color: colors.textSecondary },
    option: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    optionLabel: { color: colors.textPrimary },
    optionSubtitle: { color: colors.textSecondary },
    emptyText: { color: colors.textTertiary },
    confirmButtonDisabled: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
    },
    confirmButtonTextDisabled: { color: colors.textTertiary },
    // Accent-based styles
    optionSelected: {
      borderColor: colors.accent,
      backgroundColor: colors.accentOverlay,
    },
    confirmButton: {
      backgroundColor: colors.accentOverlayMedium,
      borderColor: colors.accentBorder,
    },
    hintText: { color: colors.accent },
    iconColor: colors.accent,
  };

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
        themedStyles.option,
        props.selected && themedStyles.optionSelected,
        pressed && styles.optionPressed,
      ]}
    >
      <View style={styles.optionContent}>
        {props.icon && <View style={styles.optionIcon}>{props.icon}</View>}
        <View style={styles.optionText}>
          <Text style={[styles.optionLabel, themedStyles.optionLabel]}>{props.label}</Text>
          {props.subtitle ? (
            <Text style={[styles.optionSubtitle, themedStyles.optionSubtitle]}>{props.subtitle}</Text>
          ) : null}
        </View>
      </View>
      {props.selected && <CheckIcon size={18} color={themedStyles.iconColor} strokeWidth={2} />}
    </Pressable>
  );

  const presetLabel = currentLabel || (currentPreset ? 'Selected' : 'Not set');
  const hasChanges = JSON.stringify(currentPreset) !== JSON.stringify(draftPreset);

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Start Button"
      icon={<PlayIcon size={24} color={themedStyles.iconColor} strokeWidth={2} />}
    >
      <Text style={modalStyles.message}>
        {currentPreset
          ? `Currently set to ${presetLabel}.`
          : 'Choose what the Start button should launch.'}
      </Text>
      <Text style={[styles.hintText, themedStyles.hintText]}>
        Press and hold the Start button to reconfigure.
      </Text>

      {currentPreset && (
        <Pressable
          onPress={() => onChange(null)}
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
        <Text style={[styles.sectionTitle, themedStyles.sectionTitle]}>Blank Workout</Text>
        {renderOption({
          label: 'Blank Workout',
          subtitle: 'Start a fresh workout log',
          selected: draftPreset?.type === 'blank',
          icon: <PlayIcon size={18} color={themedStyles.iconColor} strokeWidth={2} />,
          onPress: () => onChange({ type: 'blank' }),
        })}

        <Text style={[styles.sectionTitle, themedStyles.sectionTitle]}>Workouts</Text>
        {isLoading && templates.length === 0 ? (
          <Text style={[styles.emptyText, themedStyles.emptyText]}>Loading workouts...</Text>
        ) : templates.length === 0 ? (
          <Text style={[styles.emptyText, themedStyles.emptyText]}>No saved workouts yet.</Text>
        ) : (
          templates.map((template) => (
            <View key={`template-${template.id}`}>
              {renderOption({
                label: template.name,
                subtitle: 'Saved workout template',
                selected:
                  draftPreset?.type === 'template' &&
                  (draftPreset.templateId === template.id ||
                    template.workouts.some((w) => w.id === draftPreset.templateWorkoutId)),
                icon: <Squares2X2Icon size={18} color={themedStyles.iconColor} strokeWidth={2} />,
                onPress: () =>
                  onChange({
                    type: 'template',
                    templateId: template.id,
                    templateWorkoutId: template.workouts[0]?.id,
                  }),
              })}
            </View>
          ))
        )}

        <Text style={[styles.sectionTitle, themedStyles.sectionTitle]}>Programs</Text>
        {isLoading && programs.length === 0 ? (
          <Text style={[styles.emptyText, themedStyles.emptyText]}>Loading programs...</Text>
        ) : programs.length === 0 ? (
          <Text style={[styles.emptyText, themedStyles.emptyText]}>No programs created yet.</Text>
        ) : (
          programs.map((program) => (
            <View key={`program-${program.id}`}>
              {renderOption({
                label: program.name,
                subtitle: 'Continue to the next workout',
                selected: draftPreset?.type === 'program' && draftPreset.programId === program.id,
                icon: <CalendarDaysIcon size={18} color={themedStyles.iconColor} strokeWidth={2} />,
                onPress: () => onChange({ type: 'program', programId: program.id }),
              })}
            </View>
          ))
        )}
      </ScrollView>

      <Pressable
        onPress={onConfirm}
        disabled={!hasChanges}
        style={({ pressed }) => [
          styles.confirmButton,
          hasChanges && themedStyles.confirmButton,
          !hasChanges && themedStyles.confirmButtonDisabled,
          pressed && hasChanges && modalStyles.buttonPressed,
        ]}
      >
        <Text style={[styles.confirmButtonText, hasChanges ? { color: colors.accent } : themedStyles.confirmButtonTextDisabled]}>
          Confirm
        </Text>
      </Pressable>
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
    // borderColor and backgroundColor now applied via themedStyles.optionSelected
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
  hintText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    // color now applied via themedStyles.hintText
    textAlign: 'center',
    marginTop: -Spacing.lg,
    marginBottom: Spacing.lg,
  },
  confirmButton: {
    marginTop: Spacing.md,
    width: '100%',
    flex: 0,
    // backgroundColor and borderColor now applied via themedStyles.confirmButton
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  confirmButtonText: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    // color applied dynamically via inline styles using colors.accent
  },
  confirmButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  confirmButtonTextDisabled: {
    color: Colors.textTertiary,
  },
});
