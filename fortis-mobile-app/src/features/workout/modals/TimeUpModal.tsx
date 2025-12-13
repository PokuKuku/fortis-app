/**
 * TimeUpModal
 *
 * Alert shown when the rest timer reaches zero.
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
} from 'react-native';
import { Timer } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface TimeUpModalProps {
  visible: boolean;
  onClose: () => void;
}

export function TimeUpModal({ visible, onClose }: TimeUpModalProps) {
  useEffect(() => {
    if (visible) {
      // Auto-dismiss after 3 seconds
      const timeout = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [visible, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.content}
        >
          <Timer size={48} color="#22c55e" />
          <Text style={styles.title}>Time's Up!</Text>
          <Text style={styles.message}>Rest period complete</Text>
          <Text style={styles.dismissHint}>Tap anywhere to dismiss</Text>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#222222',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#22c55e',
  },
  message: {
    fontSize: 16,
    color: '#b9bec7',
  },
  dismissHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
});
