import { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, FlatList, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MagnifyingGlassIcon, ChevronLeftIcon } from 'react-native-heroicons/outline';
import * as Haptics from 'expo-haptics';
import { StainlessSteelPattern } from '../../components/StainlessSteelPattern';
import { Exercise } from '@/src/types/exercise';
import { useExercises } from '@/src/hooks/useExercises';
import { useTheme } from '@/src/contexts/ThemeContext';
import { Sizes, Spacing } from '@/constants/Sizes';
import { scale, moderateScale } from '@/src/utils/responsive';
import { buildExerciseSearchIndex, searchExercises } from '@/src/utils/exerciseSearch';

const HORIZONTAL_PADDING = scale(Spacing['2xl']);
const HEADER_PADDING_TOP = scale(Spacing.lg);
const HEADER_PADDING_BOTTOM = scale(Spacing.sm);
const HEADER_BUTTON_SIZE = scale(40);
const TITLE_FONT_SIZE = moderateScale(24);
const SEARCH_PADDING_BOTTOM = scale(Spacing.md);
const SEARCH_RADIUS = scale(12);
const SEARCH_PADDING_X = scale(12);
const SEARCH_ICON_MARGIN = scale(8);
const SEARCH_ICON_SIZE = scale(20);
const SEARCH_INPUT_SIZE = moderateScale(16);
const SEARCH_HEIGHT = scale(Sizes.minTouchTarget);
const FILTER_PADDING_BOTTOM = scale(Spacing.md);
const FILTER_GAP = scale(8);
const FILTER_RADIUS = scale(6);
const FILTER_PADDING_Y = scale(7);
const FILTER_PADDING_X = scale(12);
const FILTER_TEXT_SIZE = moderateScale(11);
const COUNT_PADDING_BOTTOM = scale(Spacing.md);
const COUNT_TEXT_SIZE = moderateScale(14);
const LIST_PADDING_BOTTOM = scale(120);
const LIST_GAP = scale(12);
const CARD_RADIUS = scale(16);
const CARD_PADDING = scale(16);
const CARD_CONTENT_GAP = scale(8);
const EXERCISE_NAME_SIZE = moderateScale(14);
const EXERCISE_META_SIZE = moderateScale(12);
const POPOVER_TOP = scale(218);
const POPOVER_WIDTH = scale(160);
const POPOVER_MAX_HEIGHT = scale(350);
const POPOVER_RADIUS = scale(12);
const POPOVER_LEFT = scale(24);
const POPOVER_RIGHT = scale(72);
const POPOVER_HALF_WIDTH = POPOVER_WIDTH / 2;
const POPOVER_HEADER_PADDING = scale(12);
const POPOVER_TITLE_SIZE = moderateScale(14);
const CLEAR_BUTTON_PADDING = scale(10);
const CLEAR_BUTTON_PADDING_BOTTOM = scale(4);
const CLEAR_BUTTON_TEXT_SIZE = moderateScale(11);
const POPOVER_SCROLL_MAX_HEIGHT = scale(260);
const MUSCLE_OPTION_PADDING_Y = scale(10);
const MUSCLE_OPTION_PADDING_X = scale(12);
const MUSCLE_OPTION_TEXT_SIZE = moderateScale(13);
const CHECKMARK_SIZE = scale(16);
const CHECKMARK_RADIUS = CHECKMARK_SIZE / 2;
const CHECKMARK_TEXT_SIZE = moderateScale(9);

export default function ExercisesScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [activePopover, setActivePopover] = useState<'muscle' | 'category' | 'equipment' | null>(null);
  const isNavigating = useRef(false);

  // Use centralized exercise service
  const { exercises: allExercises } = useExercises();

  const filterPopoverScale = useRef(new Animated.Value(0)).current;
  const filterPopoverOpacity = useRef(new Animated.Value(0)).current;

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    router.back();
  };

  useEffect(() => {
    if (activePopover) {
      Animated.parallel([
        Animated.spring(filterPopoverScale, {
          toValue: 1,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(filterPopoverOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(filterPopoverScale, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(filterPopoverOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [activePopover]);

  // Get unique muscles and categories
  const uniqueMuscles = useMemo(() => {
    const muscles = new Set<string>();
    allExercises.forEach(ex => {
      ex.primaryMuscles?.forEach(muscle => {
        if (muscle) muscles.add(muscle);
      });
    });
    return Array.from(muscles).sort();
  }, [allExercises]);

  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    allExercises.forEach(ex => {
      if (ex.category) categories.add(ex.category);
    });
    return Array.from(categories).sort();
  }, [allExercises]);

  const uniqueEquipment = useMemo(() => {
    const equipment = new Set<string>();
    allExercises.forEach(ex => {
      if (ex.equipment) equipment.add(ex.equipment);
    });
    return Array.from(equipment).sort();
  }, [allExercises]);

  // Theme-aware styles
  const searchWrapperTheme = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
    borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
  };

  const filterButtonTheme = {
    backgroundColor: isDark ? '#2C2C2E' : 'rgba(0,0,0,0.06)',
  };

  const exerciseCardTheme = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
  };

  const popoverTheme = {
    backgroundColor: isDark ? '#0a0a0a' : '#FFFFFF',
    borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
  };

  const popoverHeaderBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
  const muscleOptionBorder = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const optionSelectedBg = colors.accentOverlay;

  const searchIndex = useMemo(
    () => buildExerciseSearchIndex(allExercises),
    [allExercises]
  );

  const filteredExercises = useMemo(() => {
    const baseResults = searchExercises(searchQuery, searchIndex);

    return baseResults.filter((exercise) => {
      const matchesMuscle = selectedMuscles.length === 0 ||
        exercise.primaryMuscles?.some(muscle => selectedMuscles.includes(muscle));

      const matchesCategory = selectedCategories.length === 0 ||
        selectedCategories.includes(exercise.category);

      const matchesEquipment = selectedEquipment.length === 0 ||
        selectedEquipment.includes(exercise.equipment);

      return matchesMuscle && matchesCategory && matchesEquipment;
    });
  }, [searchQuery, searchIndex, selectedMuscles, selectedCategories, selectedEquipment]);

  const toggleMuscle = (muscle: string) => {
    setSelectedMuscles(prev =>
      prev.includes(muscle)
        ? prev.filter(m => m !== muscle)
        : [...prev, muscle]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleEquipment = (equipment: string) => {
    setSelectedEquipment(prev =>
      prev.includes(equipment)
        ? prev.filter(e => e !== equipment)
        : [...prev, equipment]
    );
  };

  const handleExercisePress = (exerciseId: string) => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    router.push(`/exercise/${exerciseId}`);
    setTimeout(() => { isNavigating.current = false; }, 500);
  };

  const renderExerciseCard = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={[styles.exerciseCard, exerciseCardTheme]}
      onPress={() => handleExercisePress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.exerciseCardContent}>
        <Text style={[styles.exerciseName, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.name}
        </Text>
        {item.primaryMuscles && item.primaryMuscles.length > 0 && (
          <Text style={[styles.exerciseMetaText, { color: colors.textTertiary }]} numberOfLines={1}>
            {item.primaryMuscles.join(', ')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StainlessSteelPattern />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <ChevronLeftIcon color={colors.textPrimary} size={24} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Exercises</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchWrapper, searchWrapperTheme]}>
            <MagnifyingGlassIcon color={colors.textTertiary} size={SEARCH_ICON_SIZE} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.textSecondary }]}
              placeholder="Search exercises..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filterButtonTheme]}
            onPress={() => setActivePopover(activePopover === 'muscle' ? null : 'muscle')}
          >
            <Text style={[styles.filterButtonText, { color: colors.textPrimary }]} numberOfLines={1}>
              {selectedMuscles.length > 0
                ? `${selectedMuscles.length} Body Part${selectedMuscles.length > 1 ? 's' : ''}`
                : 'Any Muscle Group'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, filterButtonTheme]}
            onPress={() => setActivePopover(activePopover === 'category' ? null : 'category')}
          >
            <Text style={[styles.filterButtonText, { color: colors.textPrimary }]} numberOfLines={1}>
              {selectedCategories.length > 0
                ? `${selectedCategories.length} Categor${selectedCategories.length > 1 ? 'ies' : 'y'}`
                : 'Any Category'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, filterButtonTheme]}
            onPress={() => setActivePopover(activePopover === 'equipment' ? null : 'equipment')}
          >
            <Text style={[styles.filterButtonText, { color: colors.textPrimary }]} numberOfLines={1}>
              {selectedEquipment.length > 0
                ? `${selectedEquipment.length} Equipment`
                : 'Any Equipment'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Exercise Count */}
        <View style={styles.countContainer}>
          <Text style={[styles.countText, { color: colors.textTertiary }]}>
            {filteredExercises.length} {filteredExercises.length === 1 ? 'exercise' : 'exercises'}
          </Text>
        </View>

        {/* Exercise List */}
        <FlatList
          data={filteredExercises}
          renderItem={renderExerciseCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={20}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      </SafeAreaView>

      {/* Muscle Filter Popover */}
      {activePopover === 'muscle' && (
        <Animated.View
          style={[styles.popoverOverlay, { opacity: filterPopoverOpacity }]}
          pointerEvents="auto"
        >
          <TouchableOpacity
            style={[styles.popoverBackdrop, { backgroundColor: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.2)' }]}
            activeOpacity={1}
            onPress={() => setActivePopover(null)}
          />
          <Animated.View style={[styles.popoverContent, styles.popoverLeft, popoverTheme, {
            transform: [{ scale: filterPopoverScale }]
          }]}>
            <StainlessSteelPattern />

            {/* Popover Header */}
            <View style={[styles.popoverHeader, { borderBottomColor: popoverHeaderBorder }]}>
              <Text style={[styles.popoverTitle, { color: colors.textSecondary }]}>Filter by Muscle Group</Text>
            </View>

            {/* Clear All Button */}
            {selectedMuscles.length > 0 && (
              <TouchableOpacity
                onPress={() => setSelectedMuscles([])}
                style={styles.clearButton}
              >
                <Text style={[styles.clearButtonText, { color: colors.accent }]}>Clear All</Text>
              </TouchableOpacity>
            )}

            {/* Muscle List */}
            <ScrollView style={styles.popoverScroll} showsVerticalScrollIndicator={false}>
              {uniqueMuscles.map((muscle) => (
                <TouchableOpacity
                  key={muscle}
                  style={[
                    styles.muscleOption,
                    { borderBottomColor: muscleOptionBorder },
                    selectedMuscles.includes(muscle) && [styles.muscleOptionSelected, { backgroundColor: optionSelectedBg }]
                  ]}
                  onPress={() => toggleMuscle(muscle)}
                >
                  <Text
                    style={[
                      styles.muscleOptionText,
                      { color: colors.textSecondary },
                      selectedMuscles.includes(muscle) && { color: colors.accent, fontWeight: '600' }
                    ]}
                  >
                    {muscle}
                  </Text>
                  {selectedMuscles.includes(muscle) && (
                    <View style={[styles.checkmark, { backgroundColor: colors.accent }]}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      )}

      {/* Category Filter Popover */}
      {activePopover === 'category' && (
        <Animated.View
          style={[styles.popoverOverlay, { opacity: filterPopoverOpacity }]}
          pointerEvents="auto"
        >
          <TouchableOpacity
            style={[styles.popoverBackdrop, { backgroundColor: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.2)' }]}
            activeOpacity={1}
            onPress={() => setActivePopover(null)}
          />
          <Animated.View style={[styles.popoverContent, styles.popoverCenter, popoverTheme, {
            transform: [{ scale: filterPopoverScale }]
          }]}>
            <StainlessSteelPattern />

            {/* Popover Header */}
            <View style={[styles.popoverHeader, { borderBottomColor: popoverHeaderBorder }]}>
              <Text style={[styles.popoverTitle, { color: colors.textSecondary }]}>Filter by Category</Text>
            </View>

            {/* Clear All Button */}
            {selectedCategories.length > 0 && (
              <TouchableOpacity
                onPress={() => setSelectedCategories([])}
                style={styles.clearButton}
              >
                <Text style={[styles.clearButtonText, { color: colors.accent }]}>Clear All</Text>
              </TouchableOpacity>
            )}

            {/* Category List */}
            <ScrollView style={styles.popoverScroll} showsVerticalScrollIndicator={false}>
              {uniqueCategories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.muscleOption,
                    { borderBottomColor: muscleOptionBorder },
                    selectedCategories.includes(category) && [styles.muscleOptionSelected, { backgroundColor: optionSelectedBg }]
                  ]}
                  onPress={() => toggleCategory(category)}
                >
                  <Text
                    style={[
                      styles.muscleOptionText,
                      { color: colors.textSecondary },
                      selectedCategories.includes(category) && { color: colors.accent, fontWeight: '600' }
                    ]}
                  >
                    {category}
                  </Text>
                  {selectedCategories.includes(category) && (
                    <View style={[styles.checkmark, { backgroundColor: colors.accent }]}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      )}

      {/* Equipment Filter Popover */}
      {activePopover === 'equipment' && (
        <Animated.View
          style={[styles.popoverOverlay, { opacity: filterPopoverOpacity }]}
          pointerEvents="auto"
        >
          <TouchableOpacity
            style={[styles.popoverBackdrop, { backgroundColor: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.2)' }]}
            activeOpacity={1}
            onPress={() => setActivePopover(null)}
          />
          <Animated.View style={[styles.popoverContent, styles.popoverRight, popoverTheme, {
            transform: [{ scale: filterPopoverScale }]
          }]}>
            <StainlessSteelPattern />

            {/* Popover Header */}
            <View style={[styles.popoverHeader, { borderBottomColor: popoverHeaderBorder }]}>
              <Text style={[styles.popoverTitle, { color: colors.textSecondary }]}>Filter by Equipment</Text>
            </View>

            {/* Clear All Button */}
            {selectedEquipment.length > 0 && (
              <TouchableOpacity
                onPress={() => setSelectedEquipment([])}
                style={styles.clearButton}
              >
                <Text style={[styles.clearButtonText, { color: colors.accent }]}>Clear All</Text>
              </TouchableOpacity>
            )}

            {/* Equipment List */}
            <ScrollView style={styles.popoverScroll} showsVerticalScrollIndicator={false}>
              {uniqueEquipment.map((equipment) => (
                <TouchableOpacity
                  key={equipment}
                  style={[
                    styles.muscleOption,
                    { borderBottomColor: muscleOptionBorder },
                    selectedEquipment.includes(equipment) && [styles.muscleOptionSelected, { backgroundColor: optionSelectedBg }]
                  ]}
                  onPress={() => toggleEquipment(equipment)}
                >
                  <Text
                    style={[
                      styles.muscleOptionText,
                      { color: colors.textSecondary },
                      selectedEquipment.includes(equipment) && { color: colors.accent, fontWeight: '600' }
                    ]}
                  >
                    {equipment}
                  </Text>
                  {selectedEquipment.includes(equipment) && (
                    <View style={[styles.checkmark, { backgroundColor: colors.accent }]}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222222',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: HEADER_PADDING_TOP,
    paddingBottom: HEADER_PADDING_BOTTOM,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: HEADER_BUTTON_SIZE,
    height: HEADER_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: HEADER_BUTTON_SIZE,
    height: HEADER_BUTTON_SIZE,
  },
  title: {
    fontSize: TITLE_FONT_SIZE,
    fontFamily: 'BankGothicBT-Medium',
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: SEARCH_PADDING_BOTTOM,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: SEARCH_RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: SEARCH_PADDING_X,
    height: SEARCH_HEIGHT,
  },
  searchIcon: {
    marginRight: SEARCH_ICON_MARGIN,
  },
  searchInput: {
    flex: 1,
    color: '#DFE2E6',
    fontSize: SEARCH_INPUT_SIZE,
    height: SEARCH_HEIGHT,
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: FILTER_PADDING_BOTTOM,
    gap: FILTER_GAP,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: FILTER_RADIUS,
    paddingVertical: FILTER_PADDING_Y,
    paddingHorizontal: FILTER_PADDING_X,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontSize: FILTER_TEXT_SIZE,
    fontWeight: '600',
  },
  countContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: COUNT_PADDING_BOTTOM,
  },
  countText: {
    fontSize: COUNT_TEXT_SIZE,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: LIST_PADDING_BOTTOM,
    gap: LIST_GAP,
  },
  exerciseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: CARD_PADDING,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 0,
  },
  exerciseCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: CARD_CONTENT_GAP,
  },
  exerciseName: {
    fontSize: EXERCISE_NAME_SIZE,
    fontWeight: '600',
    color: '#DFE2E6',
    flex: 1,
  },
  exerciseMetaText: {
    fontSize: EXERCISE_META_SIZE,
    fontWeight: '500',
    color: '#9CA3AF',
    textTransform: 'capitalize',
    flexShrink: 0,
  },
  popoverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  popoverBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  popoverContent: {
    position: 'absolute',
    top: POPOVER_TOP,
    width: POPOVER_WIDTH,
    maxHeight: POPOVER_MAX_HEIGHT,
    backgroundColor: '#0a0a0a',
    borderRadius: POPOVER_RADIUS,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  popoverLeft: {
    left: POPOVER_LEFT,
  },
  popoverCenter: {
    left: '50%',
    marginLeft: -POPOVER_HALF_WIDTH,
  },
  popoverRight: {
    right: POPOVER_RIGHT,
  },
  popoverHeader: {
    padding: POPOVER_HEADER_PADDING,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
    zIndex: 10,
  },
  popoverTitle: {
    fontSize: POPOVER_TITLE_SIZE,
    fontWeight: '600',
    color: '#DFE2E6',
  },
  clearButton: {
    padding: CLEAR_BUTTON_PADDING,
    paddingBottom: CLEAR_BUTTON_PADDING_BOTTOM,
    position: 'relative',
    zIndex: 10,
  },
  clearButtonText: {
    fontSize: CLEAR_BUTTON_TEXT_SIZE,
    fontWeight: '600',
    // color now applied via inline styles (colors.accent)
  },
  popoverScroll: {
    maxHeight: POPOVER_SCROLL_MAX_HEIGHT,
    position: 'relative',
    zIndex: 10,
  },
  muscleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: MUSCLE_OPTION_PADDING_Y,
    paddingHorizontal: MUSCLE_OPTION_PADDING_X,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  muscleOptionSelected: {
    // backgroundColor now applied via inline styles (optionSelectedBg / colors.accentOverlay)
  },
  muscleOptionText: {
    fontSize: MUSCLE_OPTION_TEXT_SIZE,
    fontWeight: '500',
    color: '#DFE2E6',
    textTransform: 'capitalize',
  },
  muscleOptionTextSelected: {
    fontWeight: '600',
    // color now applied via inline styles (colors.accent)
  },
  checkmark: {
    width: CHECKMARK_SIZE,
    height: CHECKMARK_SIZE,
    borderRadius: CHECKMARK_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor now applied via inline styles (colors.accent)
  },
  checkmarkText: {
    color: '#fff',
    fontSize: CHECKMARK_TEXT_SIZE,
    fontWeight: 'bold',
  },
});
