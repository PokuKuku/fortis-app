import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StainlessSteelPattern } from '../../components/StainlessSteelPattern';

/**
 * NOTE: This is a placeholder screen.
 * The Start button in the navigation will trigger a workout logging modal,
 * not navigate to this screen. This page exists to maintain tab structure.
 */
export default function StartScreen() {
  return (
    <View style={styles.container}>
      <StainlessSteelPattern />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.content}>
          <Text style={styles.placeholderText}>
            Start a workout using the button below
          </Text>
        </View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
