import { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StainlessSteelPattern } from '@/components/StainlessSteelPattern';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSizes, BorderRadius } from '@/constants/Sizes';
import exercisesData from '@/assets/exercises.json';
import { CUSTOM_EXERCISES_KEY } from '@/src/constants/storageKeys';
import * as Haptics from 'expo-haptics';

interface Exercise {
  id: string;
  name: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string;
  category: string;
  level: string;
  force: string;
  mechanic: string | null;
  instructions: string[];
  images: string[];
}

type TabType = 'About' | 'History' | 'Charts' | 'Records';

export default function ExerciseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<TabType>('About');
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);

  // Load custom exercises on mount
  useEffect(() => {
    const loadCustomExercises = async () => {
      try {
        const raw = await AsyncStorage.getItem(CUSTOM_EXERCISES_KEY);
        if (raw) {
          setCustomExercises(JSON.parse(raw));
        }
      } catch (err) {
        console.warn('Failed to load custom exercises', err);
      }
    };
    loadCustomExercises();
  }, []);

  // Find exercise from base data or custom exercises
  const exercise = useMemo(() => {
    const allExercises = [...customExercises, ...(exercisesData as Exercise[])];
    return allExercises.find(ex => ex.id === id);
  }, [id, customExercises]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (!exercise) {
    return (
      <SafeAreaView style={styles.container}>
        <StainlessSteelPattern />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Exercise not found</Text>
          <Pressable onPress={handleBack} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StainlessSteelPattern />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft color={Colors.textPrimary} size={24} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {exercise.name}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(['About', 'History', 'Charts', 'Records'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.tabActive]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {selectedTab === 'About' && (
          <>
            {/* Exercise Image with Title Overlay */}
            <View style={styles.exerciseImageContainer}>
              {exercise.images && exercise.images.length > 0 ? (
                <Image
                  source={{
                    uri: `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${exercise.images[0]}`,
                  }}
                  style={styles.exerciseImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Text style={styles.placeholderImageText}>No image provided</Text>
                </View>
              )}
              <LinearGradient
                colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.7)']}
                style={styles.imageGradient}
              />
              <View style={styles.imageTitleOverlay}>
                <Text style={styles.exerciseDetailTitle}>{exercise.name}</Text>
                <LinearGradient
                  colors={['#22c55e', '#16a34a']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.categoryTag}
                >
                  <Text style={styles.categoryTagText}>
                    {exercise.category || 'Custom'}
                  </Text>
                </LinearGradient>
              </View>
            </View>

            {/* Info Grid */}
            <View style={styles.infoGrid}>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>LEVEL</Text>
                <Text style={styles.infoValue}>{exercise.level || 'N/A'}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>FORCE</Text>
                <Text style={styles.infoValue}>{exercise.force || 'N/A'}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>MECHANIC</Text>
                <Text style={styles.infoValue}>{exercise.mechanic || 'N/A'}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>EQUIPMENT</Text>
                <Text style={styles.infoValue}>{exercise.equipment || 'N/A'}</Text>
              </View>
            </View>

            {/* Primary Muscles */}
            <View style={styles.musclesSection}>
              <Text style={styles.musclesSectionTitle}>PRIMARY MUSCLES</Text>
              <View style={styles.muscleTags}>
                {exercise.primaryMuscles.map((muscle, index) => (
                  <LinearGradient
                    key={index}
                    colors={['#22c55e', '#16a34a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.primaryMuscleTag}
                  >
                    <Text style={styles.primaryMuscleTagText}>{muscle}</Text>
                  </LinearGradient>
                ))}
              </View>
            </View>

            {/* Secondary Muscles */}
            {exercise.secondaryMuscles.length > 0 && (
              <View style={styles.musclesSection}>
                <Text style={styles.musclesSectionTitle}>SECONDARY MUSCLES</Text>
                <View style={styles.muscleTags}>
                  {exercise.secondaryMuscles.map((muscle, index) => (
                    <View key={index} style={styles.secondaryMuscleTag}>
                      <Text style={styles.secondaryMuscleTagText}>{muscle}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Instructions */}
            <View style={styles.instructionsSection}>
              <Text style={styles.instructionsSectionTitle}>INSTRUCTIONS</Text>
              {exercise.instructions.length === 0 ? (
                <Text style={styles.instructionText}>N/A</Text>
              ) : (
                exercise.instructions.map((instruction, index) => (
                  <View key={index} style={styles.instructionItem}>
                    <LinearGradient
                      colors={['#22c55e', '#16a34a']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.instructionNumber}
                    >
                      <Text style={styles.instructionNumberText}>{index + 1}</Text>
                    </LinearGradient>
                    <Text style={styles.instructionText}>{instruction}</Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}

        {selectedTab === 'History' && (
          <View style={styles.placeholderTab}>
            <Text style={styles.placeholderTabText}>No history yet</Text>
            <Text style={styles.placeholderTabSubtext}>
              Complete workouts with this exercise to see your history
            </Text>
          </View>
        )}

        {selectedTab === 'Charts' && (
          <View style={styles.placeholderTab}>
            <Text style={styles.placeholderTabText}>No data yet</Text>
            <Text style={styles.placeholderTabSubtext}>
              Log more workouts to see progress charts
            </Text>
          </View>
        )}

        {selectedTab === 'Records' && (
          <View style={styles.placeholderTab}>
            <Text style={styles.placeholderTabText}>No records yet</Text>
            <Text style={styles.placeholderTabSubtext}>
              Your personal records will appear here
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: Spacing['2xl'],
    marginBottom: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.md,
    padding: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing['6xl'],
  },
  exerciseImageContainer: {
    height: 180,
    marginBottom: 0,
    marginHorizontal: Spacing['2xl'],
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  imageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageTitleOverlay: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
  },
  exerciseDetailTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  categoryTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    alignSelf: 'flex-start',
  },
  categoryTagText: {
    color: '#000',
    fontSize: FontSizes.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingBottom: Spacing.lg,
  },
  placeholderImageText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    fontWeight: '500',
    marginTop: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing['2xl'],
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    marginTop: Spacing.xl,
  },
  infoBox: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: Spacing.md,
  },
  infoLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.textPrimary,
    textTransform: 'capitalize',
  },
  musclesSection: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing['2xl'],
  },
  musclesSectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
  },
  muscleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  primaryMuscleTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  primaryMuscleTagText: {
    color: '#000',
    fontSize: FontSizes.sm,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  secondaryMuscleTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  secondaryMuscleTagText: {
    color: Colors.textPrimary,
    fontSize: FontSizes.sm,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  instructionsSection: {
    marginBottom: Spacing['3xl'],
    paddingHorizontal: Spacing['2xl'],
  },
  instructionsSectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  instructionNumberText: {
    color: '#000',
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  instructionText: {
    flex: 1,
    fontSize: FontSizes.base,
    fontWeight: '500',
    lineHeight: 22,
    color: Colors.textPrimary,
  },
  placeholderTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['6xl'],
    paddingHorizontal: Spacing['2xl'],
  },
  placeholderTabText: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  placeholderTabSubtext: {
    fontSize: FontSizes.base,
    fontWeight: '500',
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  notFoundText: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  backLink: {
    padding: Spacing.md,
  },
  backLinkText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.success,
  },
});
