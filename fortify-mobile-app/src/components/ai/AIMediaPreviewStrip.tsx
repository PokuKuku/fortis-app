import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PlayIcon, XMarkIcon } from 'react-native-heroicons/solid';
import { BorderRadius, IconSizes, Spacing } from '@/constants/Sizes';
import { Typography } from '@/constants/Typography';
import { useTheme } from '@/src/contexts/ThemeContext';
import type { AIAttachmentDisplay } from '@/src/types/ai';

interface AIMediaPreviewStripProps {
  media: AIAttachmentDisplay[];
  onRemove?: (id: string) => void;
}

export function AIMediaPreviewStrip({ media, onRemove }: AIMediaPreviewStripProps) {
  const { colors, isDark } = useTheme();
  if (media.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      testID="ai-media-preview-strip"
    >
      {media.map((item) => (
        <View
          key={item.id}
          style={[
            styles.item,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
              borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
            },
          ]}
        >
          <Image source={{ uri: item.uri }} style={styles.image} />
          {item.kind === 'video' && (
            <View style={styles.videoBadge}>
              <PlayIcon color={colors.accentForegroundOnFill} size={IconSizes.xs} />
              <Text style={[styles.videoText, { color: colors.accentForegroundOnFill }]}>Video</Text>
            </View>
          )}
          {onRemove && (
            <TouchableOpacity
              style={[styles.remove, { backgroundColor: colors.background }]}
              onPress={() => onRemove(item.id)}
              accessibilityLabel={`Remove ${item.label || item.kind}`}
              testID={`remove-ai-media-${item.id}`}
            >
              <XMarkIcon color={colors.textPrimary} size={14} />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  item: {
    width: 76,
    height: 76,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'visible',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.md,
  },
  videoBadge: {
    position: 'absolute',
    left: 5,
    bottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  videoText: {
    ...Typography.caption,
    fontSize: 9,
  },
  remove: {
    position: 'absolute',
    right: -6,
    top: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
