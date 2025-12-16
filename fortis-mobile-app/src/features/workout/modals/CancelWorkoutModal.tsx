/**
 * CancelWorkoutModal
 *
 * Confirmation modal for canceling the current workout.
 */
import React from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
} from 'react-native';
import { XMarkIcon } from 'react-native-heroicons/outline';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface CancelWorkoutModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function CancelWorkoutModal({
  visible,
  onClose,
  onConfirm,
}: CancelWorkoutModalProps) {
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
            <Text style={styles.title}>Cancel Workout</Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <XMarkIcon size={20} color="#ef4444" strokeWidth={2} />
            </Pressable>
          </View>

          {/* Body */}
          <Text style={styles.message}>
            Are you sure you want to cancel this workout? All progress will be lost.
          </Text>

          {/* Buttons */}
          <View style={styles.buttons}>
            <Pressable style={styles.keepButton} onPress={onClose}>
              <Text style={styles.keepButtonText}>Keep Workout</Text>
            </Pressable>

            <Pressable style={styles.cancelButton} onPress={onConfirm}>
              <Text style={styles.cancelButtonText}>Cancel Workout</Text>
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
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
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
    flexDirection: 'row',
    gap: 12,
  },
  keepButton: {
    flex: 1,
    backgroundColor: '#333333',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  keepButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
});
