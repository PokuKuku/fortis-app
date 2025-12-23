import { Tabs, usePathname, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Text,
  Modal,
  ScrollView,
  TextInput,
  DeviceEventEmitter,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalendarDaysIcon, Bars3Icon, Squares2X2Icon, UserIcon, SparklesIcon } from 'react-native-heroicons/outline';
import { DumbbellIcon } from '../../src/components/icons/DumbbellIcon';
import { GlassButton } from '../../components/GlassButton';
import { CUSTOM_EXERCISES_KEY } from '../../src/constants/storageKeys';
import { useAIStore } from '../../src/store/aiStore';
import { Colors } from '../../constants/Colors';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  PRIMARY_MUSCLES,
  CATEGORIES,
  EQUIPMENT_TYPES,
} from '@/src/constants/exerciseOptions';
export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const isExercises = pathname?.includes('/exercises');
  // Tab bar stays at fixed position
  const tabBarBottom = 12;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth');
    }
  }, [isLoading, isAuthenticated, router]);

  // AI Store
  const { pendingActions } = useAIStore();
  const hasPendingActions = pendingActions.length > 0;
  const fabOpacity = useRef(new Animated.Value(1)).current;
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [exerciseName, setExerciseName] = useState('');
  const [primaryMuscle, setPrimaryMuscle] = useState('');
  const [secondaryMuscle, setSecondaryMuscle] = useState('');
  const [category, setCategory] = useState('');
  const [equipment, setEquipment] = useState('');
  const [instructions, setInstructions] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    name: false,
    primary: false,
    category: false,
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const nameShake = useRef(new Animated.Value(0)).current;
  const primaryShake = useRef(new Animated.Value(0)).current;
  const categoryShake = useRef(new Animated.Value(0)).current;

  // Track exercise detail modal visibility to disable FAB interactions
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('exerciseDetailVisible', (visible: boolean) => {
      setDetailModalVisible(!!visible);
    });
    return () => sub.remove();
  }, []);

  const handleFabPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/ai/chat');
  };

  const resetExerciseForm = () => {
    setExerciseName('');
    setPrimaryMuscle('');
    setSecondaryMuscle('');
    setCategory('');
    setEquipment('');
    setInstructions('');
    setEditingExerciseId(null);
  };

  const handleSaveExercise = async () => {
    const missing = {
      name: !exerciseName.trim(),
      primary: !primaryMuscle,
      category: !category,
    };
    setFieldErrors(missing);

    const triggerShake = (anim: Animated.Value) => {
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(anim, { toValue: -1, duration: 50, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    };

    if (missing.name || missing.primary || missing.category) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
      if (missing.name) triggerShake(nameShake);
      if (missing.primary) triggerShake(primaryShake);
      if (missing.category) triggerShake(categoryShake);
      return;
    }

    const instructionList = instructions
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const newExercise = {
      id: editingExerciseId ?? `custom-${Date.now()}`,
      name: exerciseName.trim(),
      primaryMuscles: [primaryMuscle],
      secondaryMuscles: secondaryMuscle ? [secondaryMuscle] : [],
      equipment: equipment || 'Bodyweight',
      category,
      instructions: instructionList,
      images: [],
    };

    try {
      const existingRaw = await AsyncStorage.getItem(CUSTOM_EXERCISES_KEY);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = editingExerciseId
        ? existing.map((ex: any) => (ex.id === editingExerciseId ? newExercise : ex))
        : [newExercise, ...existing];
      await AsyncStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(updated));
      DeviceEventEmitter.emit('customExerciseUpsert', newExercise);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    } catch (err) {
      console.warn('Failed to save custom exercise', err);
    }

    setShowAddExerciseModal(false);
    resetExerciseForm();
  };

  // Listen for edit requests from the exercises screen to prefill the modal
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('openEditExercise', (exercise: any) => {
      if (!exercise || !isExercises) return;
      setExerciseName(exercise.name || '');
      setCategory(exercise.category || '');
      setPrimaryMuscle(exercise.primaryMuscles?.[0] || '');
      setSecondaryMuscle(exercise.secondaryMuscles?.[0] || '');
      setEquipment(exercise.equipment || '');
      setInstructions(
        Array.isArray(exercise.instructions)
          ? exercise.instructions.join('\n')
          : exercise.instructions || ''
      );
      setEditingExerciseId(exercise.id || null);
      setFieldErrors({ name: false, primary: false, category: false });
      setShowAddExerciseModal(true);
    });
    return () => sub.remove();
  }, [isExercises]);

  const shakeStyle = (anim: Animated.Value) => ({
    transform: [
      {
        translateX: anim.interpolate({
          inputRange: [-1, 1],
          outputRange: [-6, 6],
        }),
      },
    ],
  });

  // Use centralized exercise option constants
  const optionList = {
    primaryMuscles: [...PRIMARY_MUSCLES],
    categories: [...CATEGORIES],
    equipmentTypes: [...EQUIPMENT_TYPES],
  };

  if (!isLoading && !isAuthenticated) {
    return null;
  }

  return (
    <>
      <Tabs
        screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#9CA3AF',
        animationEnabled: true,
        lazy: false,
        unmountOnBlur: false,
        freezeOnBlur: false,
        tabBarStyle: {
          backgroundColor: 'rgba(36, 36, 36, 0.9)',
          borderTopColor: 'rgba(255,255,255,0.1)',
          borderTopWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          paddingHorizontal: 16,
          paddingVertical: 0,
          height: 56,
          position: 'absolute',
          width: '90%',
          maxWidth: 420,
          marginHorizontal: '5%',
          bottom: tabBarBottom,
          borderRadius: 28,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 32,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 8,
          fontWeight: '600',
          marginTop: 0,
        },
        tabBarItemStyle: {
          flex: 1,
          gap: 2,
          maxWidth: 70,
        },
      }}
    >
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size = 18, focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconContainerActive]}>
              <CalendarDaysIcon color={color} size={18} strokeWidth={2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Exercises',
          tabBarIcon: ({ color, size = 18, focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconContainerActive]}>
              <Bars3Icon color={color} size={18} strokeWidth={2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="start"
        options={{
          title: 'Start',
          tabBarIcon: ({ color, size = 18, focused }) => (
            <View style={styles.centerButtonContainer}>
              <GlassButton circular size={46} style={styles.centerButton}>
                <DumbbellIcon color="#fff" size={18} fill="#fff" />
              </GlassButton>
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 8,
            fontWeight: '700',
            marginTop: 2,
          },
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Programs',
          tabBarIcon: ({ color, size = 18, focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconContainerActive]}>
              <Squares2X2Icon color={color} size={18} strokeWidth={2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size = 18, focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconContainerActive]}>
              <UserIcon color={color} size={18} strokeWidth={2} />
            </View>
          ),
        }}
      />
    </Tabs>

    {/* Plus Button */}
    <Animated.View
      style={[
        styles.plusButtonContainer,
        {
          // FAB aligned with mini bar height (88px from bottom)
          bottom: tabBarBottom + 56 + 20,
          opacity: fabOpacity,
          transform: [
            {
              scale: fabOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0.85, 1],
              }),
            },
          ],
        },
      ]}
      pointerEvents="auto"
    >
      <GlassButton
        circular
        size={60}
        style={styles.plusButton}
        onPress={handleFabPress}
        pointerEvents={detailModalVisible ? 'none' : 'auto'}
      >
        <SparklesIcon color="#fff" size={30} strokeWidth={1.5} />
        {hasPendingActions && (
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>!</Text>
          </View>
        )}
      </GlassButton>
    </Animated.View>

    {/* Add Custom Exercise Modal */}
    <Modal transparent visible={showAddExerciseModal} animationType="fade">
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => {
            setShowAddExerciseModal(false);
            resetExerciseForm();
          }}
        />
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Add Custom Exercise</Text>
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.inputLabel}>Name *</Text>
            <Animated.View style={shakeStyle(nameShake)}>
              <TextInput
                style={[
                  styles.textInput,
                  fieldErrors.name && styles.invalidInput,
                ]}
                placeholder="e.g. Single Arm Cable Row"
                placeholderTextColor="#6b7280"
                value={exerciseName}
                onChangeText={(v) => {
                  setExerciseName(v);
                  if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: false }));
                }}
              />
            </Animated.View>

            <Text style={styles.inputLabel}>Category *</Text>
            <Animated.View style={shakeStyle(categoryShake)}>
              <View style={styles.chipWrap}>
                {optionList.categories.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.chip,
                      category === item && styles.chipActive,
                      fieldErrors.category && styles.invalidChip,
                    ]}
                    onPress={() => {
                      setCategory(item);
                      if (fieldErrors.category) setFieldErrors(prev => ({ ...prev, category: false }));
                    }}
                  >
                    <Text style={[
                      styles.chipText,
                      category === item && styles.chipTextActive,
                    ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            <Text style={styles.inputLabel}>Primary Muscle *</Text>
            <Animated.View style={shakeStyle(primaryShake)}>
              <View style={styles.chipWrap}>
                {optionList.primaryMuscles.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.chip,
                      primaryMuscle === item && styles.chipActive,
                      fieldErrors.primary && styles.invalidChip,
                    ]}
                    onPress={() => {
                      setPrimaryMuscle(item);
                      if (fieldErrors.primary) setFieldErrors(prev => ({ ...prev, primary: false }));
                    }}
                  >
                    <Text style={[
                      styles.chipText,
                      primaryMuscle === item && styles.chipTextActive,
                    ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            <Text style={styles.inputLabel}>Secondary Muscle (optional)</Text>
            <View style={styles.chipWrap}>
              {optionList.primaryMuscles.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, secondaryMuscle === item && styles.chipActive]}
                  onPress={() => setSecondaryMuscle(item === secondaryMuscle ? '' : item)}
                >
                  <Text style={[styles.chipText, secondaryMuscle === item && styles.chipTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Equipment (optional)</Text>
            <View style={styles.chipWrap}>
              {optionList.equipmentTypes.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, equipment === item && styles.chipActive]}
                  onPress={() => setEquipment(item === equipment ? '' : item)}
                >
                  <Text style={[styles.chipText, equipment === item && styles.chipTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Instructions (optional)</Text>
            <TextInput
              style={[styles.textInput, styles.instructionsInput]}
              placeholder="Step-by-step cues"
              placeholderTextColor="#6b7280"
              multiline
              value={instructions}
              onChangeText={setInstructions}
            />

            <TouchableOpacity style={styles.importButton} activeOpacity={0.8}>
              <Text style={styles.importButtonText}>Import Image (coming soon)</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalActionButton, styles.modalCancel]}
              onPress={() => {
                setShowAddExerciseModal(false);
                resetExerciseForm();
              }}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalActionButton, styles.modalSave]}
              onPress={handleSaveExercise}
            >
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    padding: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconContainerActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  centerButtonContainer: {
    marginTop: -16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    borderWidth: 2,
    borderColor: 'rgba(36, 36, 36, 0.9)',
  },
  plusButtonContainer: {
    position: 'absolute',
    bottom: 24 + 56 + 8,
    right: '5%',
    zIndex: 1000,
  },
  plusButton: {
    borderWidth: 2,
    borderColor: 'rgba(36, 36, 36, 0.9)',
  },
  aiBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  actionSheetOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 950,
  },
  actionSheet: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: '#0a0a0a',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  actionHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  modalScroll: {
    maxHeight: 500,
  },
  modalScrollContent: {
    paddingBottom: 12,
    gap: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#d1d5db',
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  instructionsInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexGrow: 0,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  chipActive: {
    backgroundColor: 'rgba(34,197,94,0.2)',
    borderColor: '#22c55e',
  },
  chipText: {
    color: '#d1d5db',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#22c55e',
  },
  invalidInput: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  invalidChip: {
    borderColor: '#ef4444',
  },
  importButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  importButtonText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  modalActionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalCancel: {
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  modalSave: {
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34,197,94,0.15)',
  },
  modalCancelText: {
    color: '#d1d5db',
    fontWeight: '700',
  },
  modalSaveText: {
    color: '#22c55e',
    fontWeight: '800',
  },
});
