import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Cog6ToothIcon,
  PhotoIcon,
  UserCircleIcon,
} from 'react-native-heroicons/outline';
import { BorderRadius, IconSizes, Spacing } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/src/contexts/ThemeContext';

export type VoiceInteractionMode = 'push_to_talk' | 'realtime';

interface VoiceSettingsPopoverProps {
  interactionMode: VoiceInteractionMode;
  onInteractionModeChange: (mode: VoiceInteractionMode) => void;
  onOpenCoachingStyle: () => void;
  onAddMedia: () => void;
}

export function VoiceSettingsPopover({
  interactionMode,
  onInteractionModeChange,
  onOpenCoachingStyle,
  onAddMedia,
}: VoiceSettingsPopoverProps) {
  const { colors, isDark } = useTheme();
  const anchorRef = useRef<View>(null);
  const pendingActionRef = useRef<(() => void) | null>(null);
  const pendingActionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [visible, setVisible] = useState(false);
  const [anchor, setAnchor] = useState<{ x: number; y: number }>({ x: Spacing.lg, y: 60 });

  const open = () => {
    setVisible(true);
    anchorRef.current?.measureInWindow((x, y, _width, height) => {
      setAnchor({ x, y: y + height + Spacing.xs });
    });
  };
  const flushPendingAction = useCallback(() => {
    if (pendingActionTimeoutRef.current) {
      clearTimeout(pendingActionTimeoutRef.current);
      pendingActionTimeoutRef.current = null;
    }
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    action?.();
  }, []);

  const runAfterClose = (action: () => void) => {
    pendingActionRef.current = action;
    setVisible(false);
    // onDismiss provides the smoothest iOS handoff. The timeout covers platforms
    // where transparent modal dismissal does not emit onDismiss.
    pendingActionTimeoutRef.current = setTimeout(flushPendingAction, 220);
  };

  useEffect(() => () => {
    if (pendingActionTimeoutRef.current) clearTimeout(pendingActionTimeoutRef.current);
  }, []);

  return (
    <>
      <TouchableOpacity
        ref={anchorRef}
        testID="voice-settings-gear"
        style={[
          styles.gear,
          {
            backgroundColor: isDark ? 'rgba(255,255,255,0.055)' : 'rgba(0,0,0,0.035)',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          },
        ]}
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel="Open voice settings"
      >
        <Cog6ToothIcon color={colors.textSecondary} size={IconSizes.md} strokeWidth={1.8} />
      </TouchableOpacity>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onDismiss={flushPendingAction}
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <View
            testID="voice-settings-popover"
            style={[
              styles.popover,
              {
                left: anchor.x,
                top: anchor.y,
                backgroundColor: isDark ? '#222222' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
              },
            ]}
          >
            <Pressable style={styles.row} onPress={() => runAfterClose(onOpenCoachingStyle)}>
              <UserCircleIcon color={colors.textSecondary} size={IconSizes.md} />
              <Text style={[styles.label, { color: colors.textPrimary }]}>Coaching Style</Text>
            </Pressable>
            <Pressable
              style={styles.row}
              onPress={() => onInteractionModeChange(interactionMode === 'realtime' ? 'push_to_talk' : 'realtime')}
            >
              <View style={styles.labelBlock}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>Realtime Mode</Text>
                <Text style={[styles.caption, { color: colors.textTertiary }]}>Hands-free conversation</Text>
              </View>
              <Switch
                testID="realtime-mode-switch"
                value={interactionMode === 'realtime'}
                onValueChange={(enabled) => onInteractionModeChange(enabled ? 'realtime' : 'push_to_talk')}
                trackColor={{ false: colors.border, true: colors.accent }}
              />
            </Pressable>
            <Pressable style={styles.row} onPress={() => runAfterClose(onAddMedia)}>
              <PhotoIcon color={colors.textSecondary} size={IconSizes.md} />
              <Text style={[styles.label, { color: colors.textPrimary }]}>Add Photos or Video</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  gear: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: { flex: 1 },
  popover: {
    position: 'absolute',
    width: 260,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingVertical: Spacing.xs,
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  row: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  labelBlock: { flex: 1 },
  label: { ...Typography.bodySmall, fontWeight: '700', flex: 1 },
  caption: { ...Typography.caption, marginTop: 2 },
});
