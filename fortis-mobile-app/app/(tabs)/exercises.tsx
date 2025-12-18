import { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, FlatList, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MagnifyingGlassIcon, ArrowsUpDownIcon } from 'react-native-heroicons/outline';
import { StainlessSteelPattern } from '../../components/StainlessSteelPattern';
import { AnimatedLogo } from '../../components/AnimatedLogo';
import { Exercise } from '@/src/types/exercise';
import { useExercises } from '@/src/hooks/useExercises';

export default function ExercisesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [showMuscleModal, setShowMuscleModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const isNavigating = useRef(false);

  // Use centralized exercise service
  const { exercises: allExercises } = useExercises();

  const filterPopoverScale = useRef(new Animated.Value(0)).current;
  const filterPopoverOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const isFilterOpen = showMuscleModal || showCategoryModal || showEquipmentModal;
    if (isFilterOpen) {
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
  }, [showMuscleModal, showCategoryModal, showEquipmentModal]);

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

  const filteredExercises = allExercises.filter(exercise => {
    const matchesSearch =
      exercise.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.primaryMuscles?.some(muscle =>
        muscle?.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      exercise.equipment?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMuscle = selectedMuscles.length === 0 ||
      exercise.primaryMuscles?.some(muscle => selectedMuscles.includes(muscle));

    const matchesCategory = selectedCategories.length === 0 ||
      selectedCategories.includes(exercise.category);

    const matchesEquipment = selectedEquipment.length === 0 ||
      selectedEquipment.includes(exercise.equipment);

    return matchesSearch && matchesMuscle && matchesCategory && matchesEquipment;
  });

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
      style={styles.exerciseCard}
      onPress={() => handleExercisePress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.exerciseCardContent}>
        <Text style={styles.exerciseName} numberOfLines={1}>
          {item.name}
        </Text>
        {item.primaryMuscles && item.primaryMuscles.length > 0 && (
          <Text style={styles.exerciseMetaText} numberOfLines={1}>
            {item.primaryMuscles.join(', ')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StainlessSteelPattern />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <AnimatedLogo />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Exercises</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <MagnifyingGlassIcon color="#9CA3AF" size={20} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises..."
              placeholderTextColor="#9CA3AF"
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
            style={styles.filterButton}
            onPress={() => setShowMuscleModal(true)}
          >
            <Text style={styles.filterButtonText} numberOfLines={1}>
              {selectedMuscles.length > 0
                ? `${selectedMuscles.length} Body Part${selectedMuscles.length > 1 ? 's' : ''}`
                : 'Any Muscle Group'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={styles.filterButtonText} numberOfLines={1}>
              {selectedCategories.length > 0
                ? `${selectedCategories.length} Categor${selectedCategories.length > 1 ? 'ies' : 'y'}`
                : 'Any Category'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowEquipmentModal(true)}
          >
            <Text style={styles.filterButtonText} numberOfLines={1}>
              {selectedEquipment.length > 0
                ? `${selectedEquipment.length} Equipment`
                : 'Any Equipment'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sortButton}>
            <ArrowsUpDownIcon color="#9CA3AF" size={20} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Exercise Count */}
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
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
      {(showMuscleModal || filterPopoverOpacity._value > 0) && (
        <Animated.View
          style={[styles.popoverOverlay, { opacity: filterPopoverOpacity }]}
          pointerEvents={showMuscleModal ? 'auto' : 'none'}
        >
          <TouchableOpacity
            style={styles.popoverBackdrop}
            activeOpacity={1}
            onPress={() => setShowMuscleModal(false)}
          />
          <Animated.View style={[styles.popoverContent, styles.popoverRight, {
            transform: [{ scale: filterPopoverScale }]
          }]}>
            <StainlessSteelPattern />

            {/* Popover Header */}
            <View style={styles.popoverHeader}>
              <Text style={styles.popoverTitle}>Filter by Muscle Group</Text>
            </View>

            {/* Clear All Button */}
            {selectedMuscles.length > 0 && (
              <TouchableOpacity
                onPress={() => setSelectedMuscles([])}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            )}

            {/* Muscle List */}
            <ScrollView style={styles.popoverScroll} showsVerticalScrollIndicator={false}>
              {uniqueMuscles.map((muscle) => (
                <TouchableOpacity
                  key={muscle}
                  style={[
                    styles.muscleOption,
                    selectedMuscles.includes(muscle) && styles.muscleOptionSelected
                  ]}
                  onPress={() => toggleMuscle(muscle)}
                >
                  <Text
                    style={[
                      styles.muscleOptionText,
                      selectedMuscles.includes(muscle) && styles.muscleOptionTextSelected
                    ]}
                  >
                    {muscle}
                  </Text>
                  {selectedMuscles.includes(muscle) && (
                    <View style={styles.checkmark}>
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
      {(showCategoryModal || filterPopoverOpacity._value > 0) && (
        <Animated.View
          style={[styles.popoverOverlay, { opacity: filterPopoverOpacity }]}
          pointerEvents={showCategoryModal ? 'auto' : 'none'}
        >
          <TouchableOpacity
            style={styles.popoverBackdrop}
            activeOpacity={1}
            onPress={() => setShowCategoryModal(false)}
          />
          <Animated.View style={[styles.popoverContent, styles.popoverRight, {
            transform: [{ scale: filterPopoverScale }]
          }]}>
            <StainlessSteelPattern />

            {/* Popover Header */}
            <View style={styles.popoverHeader}>
              <Text style={styles.popoverTitle}>Filter by Category</Text>
            </View>

            {/* Clear All Button */}
            {selectedCategories.length > 0 && (
              <TouchableOpacity
                onPress={() => setSelectedCategories([])}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            )}

            {/* Category List */}
            <ScrollView style={styles.popoverScroll} showsVerticalScrollIndicator={false}>
              {uniqueCategories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.muscleOption,
                    selectedCategories.includes(category) && styles.muscleOptionSelected
                  ]}
                  onPress={() => toggleCategory(category)}
                >
                  <Text
                    style={[
                      styles.muscleOptionText,
                      selectedCategories.includes(category) && styles.muscleOptionTextSelected
                    ]}
                  >
                    {category}
                  </Text>
                  {selectedCategories.includes(category) && (
                    <View style={styles.checkmark}>
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
      {(showEquipmentModal || filterPopoverOpacity._value > 0) && (
        <Animated.View
          style={[styles.popoverOverlay, { opacity: filterPopoverOpacity }]}
          pointerEvents={showEquipmentModal ? 'auto' : 'none'}
        >
          <TouchableOpacity
            style={styles.popoverBackdrop}
            activeOpacity={1}
            onPress={() => setShowEquipmentModal(false)}
          />
          <Animated.View style={[styles.popoverContent, styles.popoverRight, {
            transform: [{ scale: filterPopoverScale }]
          }]}>
            <StainlessSteelPattern />

            {/* Popover Header */}
            <View style={styles.popoverHeader}>
              <Text style={styles.popoverTitle}>Filter by Equipment</Text>
            </View>

            {/* Clear All Button */}
            {selectedEquipment.length > 0 && (
              <TouchableOpacity
                onPress={() => setSelectedEquipment([])}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            )}

            {/* Equipment List */}
            <ScrollView style={styles.popoverScroll} showsVerticalScrollIndicator={false}>
              {uniqueEquipment.map((equipment) => (
                <TouchableOpacity
                  key={equipment}
                  style={[
                    styles.muscleOption,
                    selectedEquipment.includes(equipment) && styles.muscleOptionSelected
                  ]}
                  onPress={() => toggleEquipment(equipment)}
                >
                  <Text
                    style={[
                      styles.muscleOptionText,
                      selectedEquipment.includes(equipment) && styles.muscleOptionTextSelected
                    ]}
                  >
                    {equipment}
                  </Text>
                  {selectedEquipment.includes(equipment) && (
                    <View style={styles.checkmark}>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    alignItems: 'flex-start',
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'BankGothic',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#DFE2E6',
    fontSize: 16,
    paddingVertical: 0,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 12,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  sortButton: {
    backgroundColor: '#2C2C2E',
    borderRadius: 6,
    paddingVertical: 7,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countContainer: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  countText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
    gap: 12,
  },
  exerciseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 16,
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
    gap: 8,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DFE2E6',
    flex: 1,
  },
  exerciseMetaText: {
    fontSize: 12,
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
    top: 218,
    width: 160,
    maxHeight: 350,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
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
    left: 24,
  },
  popoverCenter: {
    left: '50%',
    marginLeft: -100,
  },
  popoverRight: {
    right: 72,
  },
  popoverHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
    zIndex: 10,
  },
  popoverTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DFE2E6',
  },
  clearButton: {
    padding: 10,
    paddingBottom: 4,
    position: 'relative',
    zIndex: 10,
  },
  clearButtonText: {
    color: '#22c55e',
    fontSize: 11,
    fontWeight: '600',
  },
  popoverScroll: {
    maxHeight: 260,
    position: 'relative',
    zIndex: 10,
  },
  muscleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  muscleOptionSelected: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  muscleOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#DFE2E6',
    textTransform: 'capitalize',
  },
  muscleOptionTextSelected: {
    color: '#22c55e',
    fontWeight: '600',
  },
  checkmark: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
});
