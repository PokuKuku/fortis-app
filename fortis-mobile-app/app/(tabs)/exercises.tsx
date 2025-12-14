import { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, FlatList, TouchableOpacity, Image, Animated, DeviceEventEmitter, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, ArrowUpDown, X, Dumbbell } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StainlessSteelPattern } from '../../components/StainlessSteelPattern';
import { AnimatedLogo } from '../../components/AnimatedLogo';
import { GlassCard } from '../../components/GlassCard';
import { GlassButton } from '../../components/GlassButton';
import exercisesData from '../../assets/exercises.json';
import { FadeOnFocus } from '../../components/FadeOnFocus';
import { CUSTOM_EXERCISES_KEY } from '../../src/constants/storageKeys';

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

export default function ExercisesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [showMuscleModal, setShowMuscleModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedTab, setSelectedTab] = useState<'About' | 'History' | 'Charts' | 'Records'>('About');
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);

  const popoverScale = useRef(new Animated.Value(0)).current;
  const popoverOpacity = useRef(new Animated.Value(0)).current;
  const filterPopoverScale = useRef(new Animated.Value(0)).current;
  const filterPopoverOpacity = useRef(new Animated.Value(0)).current;

  // Base dataset
  const baseExercises = exercisesData as Exercise[];

  // Hydrate custom exercises and subscribe to additions
  useEffect(() => {
    let isMounted = true;
    const loadCustom = async () => {
      try {
        const raw = await AsyncStorage.getItem(CUSTOM_EXERCISES_KEY);
        if (!isMounted) return;
        if (raw) {
          setCustomExercises(JSON.parse(raw));
        }
      } catch (err) {
        console.warn('Failed to load custom exercises', err);
      }
    };
    loadCustom();

    const sub = DeviceEventEmitter.addListener('customExerciseUpsert', (exercise: Exercise) => {
      setCustomExercises(prev => {
        const exists = prev.some((ex) => ex.id === exercise.id);
        return exists ? prev.map((ex) => (ex.id === exercise.id ? exercise : ex)) : [exercise, ...prev];
      });
    });

    return () => {
      isMounted = false;
      sub.remove();
    };
  }, []);

  const allExercises = useMemo(
    () => [...customExercises, ...baseExercises],
    [customExercises, baseExercises]
  );

  useEffect(() => {
    if (selectedExercise) {
      Animated.parallel([
        Animated.spring(popoverScale, {
          toValue: 1,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(popoverOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(popoverScale, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(popoverOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedExercise]);

  // Keep the open detail modal in sync after edits
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('customExerciseUpsert', (exercise: Exercise) => {
      setSelectedExercise(current =>
        current && current.id === exercise.id ? exercise : current
      );
    });
    return () => sub.remove();
  }, []);

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

  const renderExerciseCard = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={() => setSelectedExercise(item)}
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
            <Search color="#9CA3AF" size={20} style={styles.searchIcon} />
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
            <ArrowUpDown color="#9CA3AF" size={20} strokeWidth={2} />
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

      {/* Exercise Detail Non-Modal */}
      {(selectedExercise || popoverOpacity._value > 0) && (
        <Animated.View
          style={[styles.exerciseDetailOverlay, { opacity: popoverOpacity }]}
          pointerEvents={selectedExercise ? 'auto' : 'none'}
        >
          <TouchableOpacity
            style={styles.exerciseDetailBackdrop}
            activeOpacity={1}
            onPress={() => setSelectedExercise(null)}
          />
          <Animated.View style={[styles.exerciseDetailContent, {
            transform: [{ scale: popoverScale }]
          }]}>
            <StainlessSteelPattern />

            {/* Fixed Header */}
              <View style={styles.fixedHeader}>
                <View style={styles.headerTop}>
                  {selectedExercise && (
                    <TouchableOpacity
                      style={styles.editHeaderButton}
                      activeOpacity={selectedExercise.id.startsWith('custom-') ? 0.7 : 1}
                      disabled={!selectedExercise.id.startsWith('custom-')}
                      onPress={() => {
                        if (selectedExercise.id.startsWith('custom-')) {
                          DeviceEventEmitter.emit('openEditExercise', selectedExercise);
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.editHeaderText,
                          !selectedExercise.id.startsWith('custom-') && styles.editHeaderTextDisabled,
                        ]}
                      >
                        Edit
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => setSelectedExercise(null)}
                    style={styles.closeButton}
                  >
                    <X color="#fff" size={20} strokeWidth={2} />
                  </TouchableOpacity>
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
            </View>

            <ScrollView
              style={styles.exerciseDetailScroll}
              showsVerticalScrollIndicator={false}
            >
              {selectedExercise && (
                <>
                  {/* Exercise Image with Title Overlay */}
                  <View style={styles.exerciseImageContainer}>
                    {selectedExercise.images && selectedExercise.images.length > 0 ? (
                      <Image
                        source={{ uri: `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${selectedExercise.images[0]}` }}
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
                      <Text style={styles.exerciseDetailTitle}>{selectedExercise.name}</Text>
                      <LinearGradient
                        colors={['#22c55e', '#16a34a']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.categoryTag}
                      >
                        <Text style={styles.categoryTagText}>{selectedExercise.category || 'Custom'}</Text>
                      </LinearGradient>
                    </View>
                  </View>

                  {/* Info Grid */}
                  <View style={styles.infoGrid}>
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>LEVEL</Text>
                  <Text style={styles.infoValue}>{selectedExercise.level || 'N/A'}</Text>
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>FORCE</Text>
                  <Text style={styles.infoValue}>{selectedExercise.force || 'N/A'}</Text>
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>MECHANIC</Text>
                  <Text style={styles.infoValue}>{selectedExercise.mechanic || 'N/A'}</Text>
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>EQUIPMENT</Text>
                  <Text style={styles.infoValue}>{selectedExercise.equipment || 'N/A'}</Text>
                </View>
              </View>

              {/* Primary Muscles */}
              <View style={styles.musclesSection}>
                <Text style={styles.musclesSectionTitle}>PRIMARY MUSCLES</Text>
                <View style={styles.muscleTags}>
                  {selectedExercise.primaryMuscles.map((muscle, index) => (
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
              {selectedExercise.secondaryMuscles.length > 0 && (
                <View style={styles.musclesSection}>
                  <Text style={styles.musclesSectionTitle}>SECONDARY MUSCLES</Text>
                  <View style={styles.muscleTags}>
                    {selectedExercise.secondaryMuscles.map((muscle, index) => (
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
                {selectedExercise.instructions.length === 0 ? (
                  <Text style={styles.instructionText}>N/A</Text>
                ) : (
                  selectedExercise.instructions.map((instruction, index) => (
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
    fontWeight: '500',
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
  exerciseDetailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2000,
  },
  exerciseDetailBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  exerciseDetailContent: {
    position: 'absolute',
    top: 80,
    left: 24,
    right: 24,
    bottom: 100,
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  fixedHeader: {
    position: 'relative',
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 12,
  },
  exerciseDetailTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  exerciseImageContainer: {
    height: 140,
    marginBottom: 0,
    marginHorizontal: 24,
    borderRadius: 16,
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
    bottom: 16,
    left: 16,
    right: 16,
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  categoryTagText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editHeaderButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  editHeaderText: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '700',
  },
  editHeaderTextDisabled: {
    color: '#4b5563',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 20,
  },
  infoBox: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  exerciseDetailScroll: {
    flex: 1,
  },
  musclesSection: {
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  musclesSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  muscleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 16,
  },
  placeholderImageText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  primaryMuscleTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  primaryMuscleTagText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  secondaryMuscleTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  secondaryMuscleTagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  instructionsSection: {
    marginBottom: 40,
    paddingHorizontal: 24,
  },
  instructionsSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
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
    fontSize: 12,
    fontWeight: '700',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#DFE2E6',
  },
});
