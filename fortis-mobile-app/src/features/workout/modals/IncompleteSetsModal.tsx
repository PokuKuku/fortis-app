/**
 * IncompleteSetsModal
 *
 * Warning modal shown when trying to finish with incomplete sets.
 */
import React from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
} from 'react-native';
import { X, AlertTriangle } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface IncompleteSetsModalProps {
  visible: boolean;
  onClose: () => void;
  onDiscard: () => void;
}

export function IncompleteSetsModal({
  visible,
  onClose,
  onDiscard,
}: IncompleteSetsModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.content}
        >
          {/* Header */}
          <View style={styles.header}>
            <AlertTriangle size={24} color="#f59e0b" />
            <Text style={styles.title}>Incomplete Sets</Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <X size={20} color="#ef4444" strokeWidth={2.5} />
            </Pressable>
          </View>

          {/* Body */}
          <Text style={styles.message}>
            You have incomplete sets in your workout. Do you want to finish anyway?
          </Text>

          {/* Buttons */}
          <View style={styles.buttons}>
            <Pressable style={styles.continueButton} onPress={onClose}>
              <Text style={styles.continueButtonText}>Continue Workout</Text>
            </Pressable>

            <Pressable style={styles.finishButton} onPress={onDiscard}>
              <Text style={styles.finishButtonText}>Finish Anyway</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
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
    width: '90%',
    maxWidth: 400,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    backgroundColor: '#2a2a2a',
    padding: 4,
    borderRadius: 8,
  },
  message: {
    fontSize: 16,
    color: '#b9bec7',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  buttons: {
    gap: 12,
  },
  continueButton: {
    backgroundColor: '#333333',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  finishButton: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f59e0b',
  },
});
