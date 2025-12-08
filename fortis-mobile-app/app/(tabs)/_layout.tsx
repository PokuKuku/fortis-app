import { Tabs } from 'expo-router';
import { Platform, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar, List, Dumbbell, Layout, User, Plus } from 'lucide-react-native';
import { GlassButton } from '../../components/GlassButton';

export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#9CA3AF',
        animation: 'none',
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
          bottom: 24,
          borderRadius: 28,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 32,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 8,
          fontWeight: '500',
          marginTop: 2,
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
              <Calendar color={color} size={18} strokeWidth={2} />
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
              <List color={color} size={18} strokeWidth={2} />
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
                <Dumbbell color="#fff" size={18} strokeWidth={2} fill="#fff" />
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
              <Layout color={color} size={18} strokeWidth={2} />
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
              <User color={color} size={18} strokeWidth={2} />
            </View>
          ),
        }}
      />
    </Tabs>

    {/* Plus Button */}
    <View style={styles.plusButtonContainer}>
      <GlassButton circular size={60} style={styles.plusButton}>
        <Plus color="#fff" size={30} strokeWidth={2.5} />
      </GlassButton>
    </View>
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
});
