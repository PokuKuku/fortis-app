/**
 * AI Container
 *
 * Manages the mutation preview modal for AI-generated changes.
 * Chat interface is now a fullscreen route in app/ai/chat.tsx
 * Add this component to your app's root layout to enable AI features.
 */

import React, { useState, useEffect } from 'react';
import { useAIStore } from '../../store/aiStore';
import { AIMutationPreviewModal } from './AIMutationPreviewModal';

interface AIContainerProps {
  /** Whether to hide the FAB (e.g., during active workout) */
  hideFab?: boolean;
  /** Position from bottom of screen for the FAB */
  fabBottom?: number;
}

export function AIContainer({ hideFab = false, fabBottom = 88 }: AIContainerProps) {
  const [showMutationPreview, setShowMutationPreview] = useState(false);

  const currentMutationPlan = useAIStore((state) => state.currentMutationPlan);
  const loadConversation = useAIStore((state) => state.loadConversation);
  const loadPendingActions = useAIStore((state) => state.loadPendingActions);

  // Load conversation and pending actions on mount
  useEffect(() => {
    loadConversation();
    loadPendingActions();
  }, [loadConversation, loadPendingActions]);

  // Show mutation preview when plan is ready
  useEffect(() => {
    if (currentMutationPlan) {
      setShowMutationPreview(true);
    }
  }, [currentMutationPlan]);

  const handleMutationPreviewClose = () => {
    setShowMutationPreview(false);
  };

  const handleMutationConfirm = () => {
    setShowMutationPreview(false);
  };

  return (
    <>
      {/* Mutation Preview Modal */}
      <AIMutationPreviewModal
        visible={showMutationPreview}
        onClose={handleMutationPreviewClose}
        onConfirm={handleMutationConfirm}
      />
    </>
  );
}

export default AIContainer;
