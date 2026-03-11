import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { AppleLogo, GoogleLogo } from './AuthLogos';

interface AuthProviderButtonsProps {
  onGoogle: () => void;
  onApple: () => void;
  isLoadingGoogle?: boolean;
  isLoadingApple?: boolean;
  isAppleAvailable?: boolean;
}

export function AuthProviderButtons({
  onGoogle,
  onApple,
  isLoadingGoogle = false,
  isLoadingApple = false,
  isAppleAvailable = false,
}: AuthProviderButtonsProps) {
  const { colors, isDark } = useTheme();

  const themedStyles = {
    oauthButton: {
      backgroundColor: isDark ? 'rgba(24, 24, 27, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      borderColor: isDark ? 'rgba(63, 63, 70, 0.8)' : 'rgba(0, 0, 0, 0.1)',
    },
    oauthButtonText: { color: isDark ? colors.white : colors.textPrimary },
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
            <ActivityIndicator color={colors.textPrimary} size="small" />
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
              <ActivityIndicator color={colors.textPrimary} size="small" />
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
});
