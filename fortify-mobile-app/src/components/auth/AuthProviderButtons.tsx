import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassButton } from '@/components/GlassButton';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { AppleLogo, GoogleLogo } from './AuthLogos';
import { ActionProgressLabel } from '@/src/components/ui/ActionProgressLabel';

interface AuthProviderButtonsProps {
  onGoogle: () => void;
  onApple: () => void;
  onEmail?: (() => void) | null;
  isLoadingGoogle?: boolean;
  isLoadingApple?: boolean;
  isAppleAvailable?: boolean;
  showEmailButton?: boolean;
  showDivider?: boolean;
}

export function AuthProviderButtons({
  onGoogle,
  onApple,
  onEmail = null,
  isLoadingGoogle = false,
  isLoadingApple = false,
  isAppleAvailable = false,
  showEmailButton = false,
  showDivider = false,
}: AuthProviderButtonsProps) {
  const { colors, isDark } = useTheme();

  const themedStyles = {
    oauthButton: {
      backgroundColor: isDark ? 'rgba(24, 24, 27, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      borderColor: isDark ? 'rgba(63, 63, 70, 0.8)' : 'rgba(0, 0, 0, 0.1)',
    },
    oauthButtonText: { color: isDark ? colors.white : colors.textPrimary },
    dividerText: { color: colors.textSecondary },
    emailButtonText: { color: colors.accentForegroundOnFill },
  };

  return (
    <View style={styles.container}>
      <View style={styles.oauthButtons}>
        <TouchableOpacity
          style={[styles.oauthButton, themedStyles.oauthButton]}
          onPress={onGoogle}
          disabled={isLoadingGoogle || isLoadingApple}
          activeOpacity={0.8}
        >
          {isLoadingGoogle ? (
            <ActionProgressLabel
              label="Connecting to Google…"
              color={themedStyles.oauthButtonText.color}
              style={styles.oauthButtonText}
            />
          ) : (
            <>
              <View style={styles.oauthIconContainer}>
                <GoogleLogo size={20} />
              </View>
              <Text style={[styles.oauthButtonText, themedStyles.oauthButtonText]}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {isAppleAvailable && (
          <TouchableOpacity
            style={[styles.oauthButton, themedStyles.oauthButton]}
            onPress={onApple}
            disabled={isLoadingApple || isLoadingGoogle}
            activeOpacity={0.8}
          >
            {isLoadingApple ? (
              <ActionProgressLabel
                label="Connecting to Apple…"
                color={themedStyles.oauthButtonText.color}
                style={styles.oauthButtonText}
              />
            ) : (
              <>
                <View style={styles.oauthIconContainer}>
                  <AppleLogo size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                </View>
                <Text style={[styles.oauthButtonText, themedStyles.oauthButtonText]}>Continue with Apple</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {showEmailButton && onEmail && showDivider && (
        <View style={styles.divider}>
          <LinearGradient
            colors={isDark
              ? ['transparent', 'rgba(113,113,122,0.5)', 'transparent']
              : ['transparent', 'rgba(0,0,0,0.15)', 'transparent']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.dividerGradient}
          />
          <Text style={[styles.dividerText, themedStyles.dividerText]}>or</Text>
          <LinearGradient
            colors={isDark
              ? ['transparent', 'rgba(113,113,122,0.5)', 'transparent']
              : ['transparent', 'rgba(0,0,0,0.15)', 'transparent']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.dividerGradient}
          />
        </View>
      )}

      {showEmailButton && onEmail && (
        <GlassButton
          style={styles.emailButton}
          onPress={onEmail}
        >
          <Text style={[styles.emailButtonText, themedStyles.emailButtonText]}>Continue with Email</Text>
        </GlassButton>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
  },
  oauthButtons: {
    gap: Spacing.md,
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(24, 24, 27, 0.9)',
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(63, 63, 70, 0.8)',
  },
  oauthIconContainer: {
    position: 'absolute',
    left: Spacing.lg,
  },
  oauthButtonText: {
    ...Typography.button,
    color: Colors.white,
    fontSize: 15,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
    gap: Spacing.lg,
  },
  dividerGradient: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  emailButton: {
    height: 44,
    borderRadius: 22,
  },
  emailButtonText: {
    ...Typography.button,
    fontSize: 15,
  },
});
