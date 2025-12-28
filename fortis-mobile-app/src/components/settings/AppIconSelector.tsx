import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ChevronLeftIcon, CheckIcon } from 'react-native-heroicons/outline';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useAppIcon, APP_ICONS, type AppIconVariant } from '@/src/contexts/AppIconContext';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { Colors } from '@/constants/Colors';

interface AppIconSelectorProps {
  visible: boolean;
  onClose: () => void;
}

export function AppIconSelector({ visible, onClose }: AppIconSelectorProps) {
  const { colors, isDark } = useTheme();
  const { currentIcon, setAppIcon, isSupported } = useAppIcon();

  const handleSelectIcon = async (iconName: AppIconVariant) => {
    if (iconName === currentIcon) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await setAppIcon(iconName);
    } catch (error) {
      console.error('Failed to set app icon:', error);
    }
  };

  const cardStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
  };

  // Get the current icon preview
  const currentIconInfo = APP_ICONS.find(icon => icon.name === currentIcon) || APP_ICONS[0];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StainlessSteelPattern />

        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <ChevronLeftIcon color={colors.textPrimary} size={24} strokeWidth={2} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>App Icon</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.content}>
            {/* Large preview */}
            <View style={styles.previewContainer}>
              <View style={[styles.previewWrapper, cardStyle]}>
                <Image
                  source={currentIconInfo.preview}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>
                {currentIconInfo.displayName}
              </Text>
            </View>

            {/* Icon grid */}
            <View style={[styles.iconGrid, cardStyle]}>
              {APP_ICONS.filter(icon => icon.name !== 'Default').map((icon) => (
                <Pressable
                  key={icon.name}
                  style={[
                    styles.iconOption,
                    currentIcon === icon.name && styles.iconOptionSelected,
                    currentIcon === icon.name && { borderColor: Colors.success },
                  ]}
                  onPress={() => handleSelectIcon(icon.name)}
                >
                  <Image
                    source={icon.preview}
                    style={styles.iconImage}
                    resizeMode="cover"
                  />
                  {currentIcon === icon.name && (
                    <View style={styles.checkmarkContainer}>
                      <CheckIcon color={Colors.white} size={12} strokeWidth={3} />
                    </View>
                  )}
                  <Text style={[styles.iconLabel, { color: colors.textPrimary }]}>
                    {icon.displayName}
                  </Text>
                </Pressable>
              ))}
            </View>

            {!isSupported && (
              <Text style={[styles.warningText, { color: colors.textSecondary }]}>
                Alternate app icons are only available on iOS.
              </Text>
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.h2,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['3xl'],
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  previewWrapper: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewLabel: {
    ...Typography.caption,
  },
  iconGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  iconOption: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconOptionSelected: {
    opacity: 1,
  },
  iconImage: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: {
    ...Typography.caption,
  },
  warningText: {
    ...Typography.caption,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
