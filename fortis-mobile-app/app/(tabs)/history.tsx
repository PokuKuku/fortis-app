import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StainlessSteelPattern } from '../../components/StainlessSteelPattern';
import { AnimatedLogo } from '../../components/AnimatedLogo';

export default function HistoryScreen() {
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
          <Text style={styles.sectionTitle}>History</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.placeholder}>Calendar and workout history coming soon...</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
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
    fontWeight: '900',
    fontFamily: 'BankGothic',
    color: '#22c55e',
    letterSpacing: 6,
    textAlign: 'left',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 40,
  },
});
