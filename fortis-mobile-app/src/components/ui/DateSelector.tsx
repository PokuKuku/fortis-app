import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { ChevronDownIcon } from 'react-native-heroicons/outline';
import { Colors } from '../../../constants/Colors';
import { Spacing, BorderRadius } from '../../../constants/Sizes';
import { Typography } from '../../../constants/Typography';
import { StainlessSteelPattern } from '../../../components/StainlessSteelPattern';
import { useTheme } from '@/src/contexts/ThemeContext';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

// Generate years range (5 years back, 5 years forward)
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

interface DateSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  currentDate: Date;
  selectedDate: Date;
}

// Get days in a month
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// Get the first day of the month (0 = Sunday, 6 = Saturday)
function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

// Generate calendar grid
function generateCalendarDays(year: number, month: number): (number | null)[] {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days: (number | null)[] = [];

  // Add empty cells for days before the first day
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add the days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return days;
}

// Mini Calendar Day Component
function MiniCalendarDay({
  day,
  isSelected,
  isToday,
  onPress,
  textColor,
  todayBorderColor,
}: {
  day: number | null;
  isSelected: boolean;
  isToday: boolean;
  onPress: () => void;
  textColor: string;
  todayBorderColor: string;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (day === null) {
    return <View style={styles.dayCell} />;
  }

  const handlePressIn = () => {
    scale.value = withTiming(0.9, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  return (
    <View style={styles.dayCell}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.dayButton,
          isSelected && styles.dayButtonSelected,
          isToday && !isSelected && [styles.dayButtonToday, { borderColor: todayBorderColor }],
          animatedStyle,
        ]}
      >
        <Text
          style={[
            styles.dayButtonText,
            { color: textColor },
            isSelected && styles.dayButtonTextSelected,
            isToday && !isSelected && styles.dayButtonTextToday,
          ]}
        >
          {day}
        </Text>
      </AnimatedPressable>
    </View>
  );
}

export function DateSelector({
  visible,
  onClose,
  onSelectDate,
  currentDate,
  selectedDate,
}: DateSelectorProps) {
  const { colors, isDark } = useTheme();
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth());
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  const [tempSelectedDay, setTempSelectedDay] = useState(selectedDate.getDate());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  // Theme-aware styles
  const themedStyles = {
    modalContent: {
      backgroundColor: isDark ? '#222222' : '#FFFFFF',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    selector: {
      backgroundColor: isDark ? '#2a2a2a' : 'rgba(0, 0, 0, 0.05)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    selectorText: { color: colors.textPrimary },
    dropdown: {
      backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    dropdownItemText: { color: colors.textPrimary },
    calendarContainer: {
      borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    },
    dayHeaderText: { color: colors.textTertiary },
    dayText: colors.textPrimary,
    todayBorder: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
  };

  // Update state when currentDate changes
  useEffect(() => {
    setViewMonth(currentDate.getMonth());
    setViewYear(currentDate.getFullYear());
    setTempSelectedDay(selectedDate.getDate());
  }, [currentDate, selectedDate]);

  // Generate calendar days for current view
  const calendarDays = useMemo(
    () => generateCalendarDays(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  // Check if a day is the selected day
  const isSelectedDay = (day: number | null): boolean => {
    if (day === null) return false;
    return (
      day === tempSelectedDay &&
      viewMonth === selectedDate.getMonth() &&
      viewYear === selectedDate.getFullYear()
    );
  };

  // Check if a day is today
  const today = new Date();
  const isToday = (day: number | null): boolean => {
    if (day === null) return false;
    return (
      day === today.getDate() &&
      viewMonth === today.getMonth() &&
      viewYear === today.getFullYear()
    );
  };

  const handleJump = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newDate = new Date(viewYear, viewMonth, tempSelectedDay);
    onSelectDate(newDate);
    onClose();
  };

  const handleDayPress = (day: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTempSelectedDay(day);
  };

  const handleMonthSelect = (monthIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewMonth(monthIndex);
    setShowMonthPicker(false);
  };

  const handleYearSelect = (year: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewYear(year);
    setShowYearPicker(false);
  };

  const toggleMonthPicker = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowMonthPicker(!showMonthPicker);
    setShowYearPicker(false);
  };

  const toggleYearPicker = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowYearPicker(!showYearPicker);
    setShowMonthPicker(false);
  };

  // Close dropdowns when tapping outside
  const handleContentPress = () => {
    if (showMonthPicker || showYearPicker) {
      setShowMonthPicker(false);
      setShowYearPicker(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={StyleSheet.absoluteFill}
        />
      </Pressable>

      <View style={styles.centeredView}>
        <Animated.View
          entering={SlideInDown.duration(250)}
          exiting={SlideOutDown.duration(200)}
          style={[styles.modalContent, themedStyles.modalContent]}
        >
          <StainlessSteelPattern />

          <Pressable style={styles.innerContent} onPress={handleContentPress}>
            {/* Selectors Row */}
            <View style={styles.selectorsRow}>
              {/* Month Selector */}
              <View style={[styles.selectorContainer, { zIndex: showMonthPicker ? 20 : 10 }]}>
                <Pressable
                  style={[styles.selector, themedStyles.selector, showMonthPicker && styles.selectorActive]}
                  onPress={toggleMonthPicker}
                >
                  <Text style={[styles.selectorText, themedStyles.selectorText]}>{MONTHS[viewMonth]}</Text>
                  <ChevronDownIcon
                    color={colors.textSecondary}
                    size={14}
                    style={showMonthPicker ? styles.chevronRotated : undefined}
                  />
                </Pressable>

                {showMonthPicker && (
                  <Animated.View
                    entering={FadeIn.duration(150)}
                    style={[styles.dropdown, themedStyles.dropdown]}
                  >
                    <ScrollView
                      style={styles.dropdownScroll}
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled
                    >
                      {MONTHS.map((month, index) => (
                        <Pressable
                          key={month}
                          style={[
                            styles.dropdownItem,
                            viewMonth === index && styles.dropdownItemSelected,
                          ]}
                          onPress={() => handleMonthSelect(index)}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              themedStyles.dropdownItemText,
                              viewMonth === index && styles.dropdownItemTextSelected,
                            ]}
                          >
                            {month}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </Animated.View>
                )}
              </View>

              {/* Year Selector */}
              <View style={[styles.selectorContainer, { zIndex: showYearPicker ? 20 : 10 }]}>
                <Pressable
                  style={[styles.selector, themedStyles.selector, showYearPicker && styles.selectorActive]}
                  onPress={toggleYearPicker}
                >
                  <Text style={[styles.selectorText, themedStyles.selectorText]}>{viewYear}</Text>
                  <ChevronDownIcon
                    color={colors.textSecondary}
                    size={14}
                    style={showYearPicker ? styles.chevronRotated : undefined}
                  />
                </Pressable>

                {showYearPicker && (
                  <Animated.View
                    entering={FadeIn.duration(150)}
                    style={[styles.dropdown, themedStyles.dropdown]}
                  >
                    <ScrollView
                      style={styles.dropdownScroll}
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled
                    >
                      {YEARS.map((year) => (
                        <Pressable
                          key={year}
                          style={[
                            styles.dropdownItem,
                            viewYear === year && styles.dropdownItemSelected,
                          ]}
                          onPress={() => handleYearSelect(year)}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              themedStyles.dropdownItemText,
                              viewYear === year && styles.dropdownItemTextSelected,
                            ]}
                          >
                            {year}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </Animated.View>
                )}
              </View>
            </View>

            {/* Mini Calendar */}
            <View style={[styles.calendarContainer, themedStyles.calendarContainer]}>
              {/* Day headers */}
              <View style={styles.dayHeaderRow}>
                {DAYS_OF_WEEK.map((day) => (
                  <View key={day} style={styles.dayHeaderCell}>
                    <Text style={[styles.dayHeaderText, themedStyles.dayHeaderText]}>{day}</Text>
                  </View>
                ))}
              </View>

              {/* Calendar grid */}
              <View style={styles.calendarGrid}>
                {calendarDays.map((day, index) => (
                  <MiniCalendarDay
                    key={index}
                    day={day}
                    isSelected={isSelectedDay(day)}
                    isToday={isToday(day)}
                    onPress={() => day && handleDayPress(day)}
                    textColor={themedStyles.dayText}
                    todayBorderColor={themedStyles.todayBorder}
                  />
                ))}
              </View>
            </View>

            {/* Jump Button */}
            <Pressable style={styles.jumpButton} onPress={handleJump}>
              <Text style={styles.jumpButtonText}>
                JUMP TO {MONTHS[viewMonth].toUpperCase()} {viewYear}
              </Text>
            </Pressable>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  modalContent: {
    width: 280,
    backgroundColor: '#222222',
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  innerContent: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  selectorsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    zIndex: 10,
  },
  selectorContainer: {
    flex: 1,
    position: 'relative',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    height: 32,
  },
  selectorActive: {
    borderColor: Colors.success,
  },
  selectorText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontSize: 12,
  },
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    zIndex: 100,
    elevation: 10,
  },
  dropdownScroll: {
    maxHeight: 180,
  },
  dropdownItem: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  dropdownItemText: {
    ...Typography.caption,
    color: '#DFE2E6',
    fontSize: 12,
  },
  dropdownItemTextSelected: {
    color: Colors.success,
    fontWeight: '600',
  },
  calendarContainer: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: Spacing.xs,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayHeaderText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9CA3AF',
    opacity: 0.6,
    letterSpacing: 0.5,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', // 7 columns
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dayButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonSelected: {
    backgroundColor: Colors.success,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  dayButtonToday: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  dayButtonText: {
    fontSize: 13,
    color: '#DFE2E6',
  },
  dayButtonTextSelected: {
    color: '#1a1a1a',
    fontWeight: '700',
  },
  dayButtonTextToday: {
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  jumpButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
  },
  jumpButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
    letterSpacing: 0.5,
  },
});
