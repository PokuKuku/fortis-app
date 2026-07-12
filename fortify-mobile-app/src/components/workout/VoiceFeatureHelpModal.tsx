import { Pressable, StyleSheet, Text, View } from 'react-native';
import Reanimated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { BorderRadius, Spacing } from '@/constants/Sizes';
import { useTheme } from '@/src/contexts/ThemeContext';

const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable);

type Props = {
  title: string;
  description: string;
  examples: string[];
  note: string;
  onClose: () => void;
};

export function VoiceFeatureHelpModal({ title, description, examples, note, onClose }: Props) {
  const { colors, isDark } = useTheme();

  return (
    <Reanimated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={styles.overlay}
    >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close explanation"
          style={StyleSheet.absoluteFillObject}
          onPress={(event) => {
            event.stopPropagation();
            onClose();
          }}
        />
        <AnimatedPressable
          entering={ZoomIn.duration(250)}
          exiting={ZoomOut.duration(200)}
          onPress={(event) => event.stopPropagation()}
          style={[styles.card, {
            backgroundColor: colors.background,
            borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
          }]}
        >
          <StainlessSteelPattern />
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
          <View style={[styles.examples, {
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
          }]}>
            <Text style={[styles.exampleLabel, { color: colors.accent }]}>Try saying</Text>
            {examples.map((example) => (
              <Text key={example} style={[styles.example, { color: colors.textPrimary }]}>“{example}”</Text>
            ))}
          </View>
          <Text style={[styles.note, { color: colors.textSecondary }]}>{note}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Close ${title} explanation`}
            onPress={(event) => {
              event.stopPropagation();
              onClose();
            }}
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: colors.accent },
              pressed && styles.closeButtonPressed,
            ]}
          >
            <Text style={[styles.closeButtonText, { color: colors.accentForegroundOnFill }]}>Got it</Text>
          </Pressable>
        </AnimatedPressable>
    </Reanimated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
    overflow: 'hidden',
  },
  title: {
    fontSize: 20,
    fontFamily: 'BankGothicBT-Medium',
    fontWeight: '800',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  description: { fontSize: 14, lineHeight: 20 },
  examples: { borderWidth: 1, borderRadius: BorderRadius.md, padding: Spacing.md, gap: Spacing.sm },
  exampleLabel: {
    fontSize: 12,
    fontFamily: 'BankGothicBT-Medium',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  example: { fontSize: 14, fontWeight: '700', lineHeight: 20 },
  note: { fontSize: 13, lineHeight: 18 },
  closeButton: {
    minHeight: 46,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonPressed: { opacity: 0.82 },
  closeButtonText: {
    fontSize: 14,
    fontFamily: 'BankGothicBT-Medium',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
