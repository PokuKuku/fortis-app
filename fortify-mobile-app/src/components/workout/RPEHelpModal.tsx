import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { XMarkIcon } from 'react-native-heroicons/outline';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import { RPE_TO_RIR } from '@/src/types/workout';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface RPEHelpModalProps {
  visible: boolean;
  onClose: () => void;
}

const RPE_ROWS = [
  { rpe: 6, rir: '4 RIR' },
  { rpe: 7, rir: '3 RIR' },
  { rpe: 8, rir: '2 RIR' },
  { rpe: 9, rir: '1 RIR' },
  { rpe: 10, rir: '0 RIR' },
];

export function RPEHelpModal({ visible, onClose }: RPEHelpModalProps) {
  const { colors, isDark } = useTheme();

  // Dynamic theme-aware styles
  const themedStyles = {
    container: {
      backgroundColor: isDark ? Colors.background : '#FFFFFF',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
    },
    title: { color: colors.textPrimary },
    descriptionText: { color: colors.textSecondary },
    table: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
    },
    tableRowBorder: {
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    rpeText: { color: colors.textPrimary },
    rirText: { color: colors.textSecondary },
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        style={styles.overlay}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        <Animated.View
          entering={ZoomIn.duration(250)}
          exiting={ZoomOut.duration(200)}
          style={[styles.container, themedStyles.container]}
        >
          <StainlessSteelPattern />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerSpacer} />
            <Text style={[styles.title, themedStyles.title]}>Understanding RPE</Text>
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}
            >
              <XMarkIcon size={20} color={Colors.error} strokeWidth={2} />
            </Pressable>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={[styles.descriptionText, themedStyles.descriptionText]}>
              Rate of Perceived Exertion (RPE) is a metric that attempts to
              measure the difficulty of a set.
            </Text>
            <Text style={[styles.descriptionText, styles.descriptionSpacing, themedStyles.descriptionText]}>
              Reps in reserve (RIR) is an estimate of how many more reps you
              could perform before reaching muscular failure.
            </Text>
          </View>

          {/* RPE to RIR table */}
          <View style={[styles.table, themedStyles.table]}>
            {RPE_ROWS.map((row, index) => (
              <View
                key={row.rpe}
                style={[
                  styles.tableRow,
                  index < RPE_ROWS.length - 1 && [styles.tableRowBorder, themedStyles.tableRowBorder],
                ]}
              >
                <Text style={[styles.rpeText, themedStyles.rpeText]}>{row.rpe} RPE</Text>
                <Text style={[styles.rirText, themedStyles.rirText]}>{row.rir}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['2xl'],
  },
  container: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerSpacer: {
    width: 32,
    height: 32,
  },
  title: {
    fontSize: FontSizes.lg,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonPressed: {
    opacity: 0.6,
  },
  descriptionSection: {
    marginBottom: Spacing.lg,
  },
  descriptionText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  descriptionSpacing: {
    marginTop: Spacing.md,
  },
  table: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  rpeText: {
    fontSize: FontSizes.base,
    fontFamily: 'BankGothicBT-Medium',
    color: Colors.textPrimary,
  },
  rirText: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
  },
});
