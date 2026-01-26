import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { EnvelopeIcon, LockClosedIcon, UserIcon } from 'react-native-heroicons/outline';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { GlassButton } from '@/components/GlassButton';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, FontSizes } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const signUpSchema = signInSchema.extend({
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;

export default function EmailAuthScreen() {
  const router = useRouter();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const { colors, isDark } = useTheme();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Dynamic theme-aware styles
  const themedStyles = {
    container: { backgroundColor: colors.background },
    backButton: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    title: { color: colors.textPrimary },
    subtitle: { color: colors.textSecondary },
    label: { color: colors.textSecondary },
    inputWrapper: {
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(63, 63, 70, 0.8)' : 'rgba(0, 0, 0, 0.12)',
    },
    inputWrapperFocused: {
      borderColor: isDark ? 'rgba(63, 63, 70, 1)' : 'rgba(0, 0, 0, 0.2)',
    },
    input: { color: colors.textPrimary },
    toggleText: { color: colors.textSecondary },
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const toggleMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSignUp(!isSignUp);
    setError(null);
    reset();
  };

  const onSubmit = async (data: SignInFormData | SignUpFormData) => {
    Keyboard.dismiss();
    setError(null);
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const { error: authError } = isSignUp
      ? await signUpWithEmail(data.email, data.password)
      : await signInWithEmail(data.email, data.password);

    setIsLoading(false);

    if (authError) {
      const isOnboardingSource = source === 'onboarding';
      const isInvalidCredentials = authError.message.toLowerCase().includes('invalid login credentials');
      if (!isSignUp && isOnboardingSource && isInvalidCredentials) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsLoading(false);
        setError(null);
        router.replace('/onboarding');
        return;
      }
      setError(authError.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Auth context will handle navigation
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, themedStyles.container]}>
        <StainlessSteelPattern />

        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={handleBack}
                style={[styles.backButton, themedStyles.backButton]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ChevronLeftIcon color={colors.textPrimary} size={24} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={[styles.title, themedStyles.title]}>
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </Text>
              <Text style={[styles.subtitle, themedStyles.subtitle]}>
                {isSignUp
                  ? 'Enter your email to get started'
                  : 'Sign in to continue your journey'}
              </Text>

              {/* Form */}
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, themedStyles.label]}>Email</Text>
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View style={[
                        styles.inputWrapper,
                        themedStyles.inputWrapper,
                        focusedField === 'email' && styles.inputWrapperFocused,
                        focusedField === 'email' && themedStyles.inputWrapperFocused,
                        errors.email && styles.inputWrapperError,
                      ]}>
                        <EnvelopeIcon
                          size={18}
                          color={focusedField === 'email' ? colors.accent : colors.textSecondary}
                          strokeWidth={2}
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={[styles.input, themedStyles.input]}
                          placeholder="your@email.com"
                          placeholderTextColor={colors.textSecondary}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoComplete="email"
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => {
                            setFocusedField(null);
                            onBlur();
                          }}
                          onChangeText={onChange}
                          value={value}
                        />
                      </View>
                    )}
                  />
                  {errors.email && (
                    <Text style={styles.errorText}>{errors.email.message}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, themedStyles.label]}>Password</Text>
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View style={[
                        styles.inputWrapper,
                        themedStyles.inputWrapper,
                        focusedField === 'password' && styles.inputWrapperFocused,
                        focusedField === 'password' && themedStyles.inputWrapperFocused,
                        errors.password && styles.inputWrapperError,
                      ]}>
                        <LockClosedIcon
                          size={18}
                          color={focusedField === 'password' ? colors.accent : colors.textSecondary}
                          strokeWidth={2}
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={[styles.input, themedStyles.input]}
                          placeholder="Enter your password"
                          placeholderTextColor={colors.textSecondary}
                          secureTextEntry
                          autoComplete="password"
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => {
                            setFocusedField(null);
                            onBlur();
                          }}
                          onChangeText={onChange}
                          value={value}
                        />
                      </View>
                    )}
                  />
                  {errors.password && (
                    <Text style={styles.errorText}>{errors.password.message}</Text>
                  )}
                </View>

                {isSignUp && (
                  <View style={styles.inputContainer}>
                    <Text style={[styles.label, themedStyles.label]}>Confirm Password</Text>
                    <Controller
                      control={control}
                      name="confirmPassword"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <View style={[
                          styles.inputWrapper,
                          themedStyles.inputWrapper,
                          focusedField === 'confirmPassword' && styles.inputWrapperFocused,
                          focusedField === 'confirmPassword' && themedStyles.inputWrapperFocused,
                          errors.confirmPassword && styles.inputWrapperError,
                        ]}>
                          <LockClosedIcon
                            size={18}
                            color={focusedField === 'confirmPassword' ? colors.accent : colors.textSecondary}
                            strokeWidth={2}
                            style={styles.inputIcon}
                          />
                          <TextInput
                            style={[styles.input, themedStyles.input]}
                            placeholder="Confirm your password"
                            placeholderTextColor={colors.textSecondary}
                            secureTextEntry
                            autoComplete="password-new"
                            onFocus={() => setFocusedField('confirmPassword')}
                            onBlur={() => {
                              setFocusedField(null);
                              onBlur();
                            }}
                            onChangeText={onChange}
                            value={value}
                          />
                        </View>
                      )}
                    />
                    {errors.confirmPassword && (
                      <Text style={styles.errorText}>
                        {errors.confirmPassword.message}
                      </Text>
                    )}
                  </View>
                )}

                {/* Error Message */}
                {error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorMessage}>{error}</Text>
                  </View>
                )}

                {/* Submit Button */}
                <GlassButton
                  style={styles.submitButton}
                  onPress={handleSubmit(onSubmit)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={Colors.white} size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </Text>
                  )}
                </GlassButton>
              </View>

              {/* Toggle Mode */}
              <View style={styles.toggleContainer}>
                <Text style={[styles.toggleText, themedStyles.toggleText]}>
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                </Text>
                <TouchableOpacity onPress={toggleMode}>
                  <Text style={styles.toggleLink}>
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['3xl'],
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing['3xl'],
  },
  form: {
    gap: Spacing.lg,
  },
  inputContainer: {
    gap: Spacing.xs,
  },
  label: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(63, 63, 70, 0.8)',
    paddingHorizontal: Spacing.md,
  },
  inputWrapperFocused: {
    borderColor: 'rgba(63, 63, 70, 1)',
  },
  inputWrapperError: {
    borderColor: Colors.error,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    ...Typography.body,
    color: Colors.textPrimary,
    lineHeight: FontSizes.base,
    paddingVertical: 0,
    paddingTop: 1,
    paddingBottom: 0,
    textAlignVertical: 'center',
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginLeft: Spacing.xs,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  errorMessage: {
    ...Typography.caption,
    color: Colors.error,
    textAlign: 'center',
  },
  submitButton: {
    height: 44,
    borderRadius: 22,
    marginTop: Spacing.md,
  },
  submitButtonText: {
    ...Typography.button,
    color: Colors.white,
    fontSize: 15,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing['2xl'],
  },
  toggleText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  toggleLink: {
    ...Typography.body,
    color: Colors.success,
    fontWeight: '600',
  },
});
