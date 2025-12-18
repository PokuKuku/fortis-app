/**
 * AI Container
 *
 * Main container that manages the AI FAB, chat modal, and mutation preview.
 * Add this component to your app's root layout to enable AI features.
 */

import React, { useState, useEffect } from 'react';
import { useAIStore } from '../../store/aiStore';
import { AIFab } from './AIFab';
import { AIChatModal } from './AIChatModal';
import { AIMutationPreviewModal } from './AIMutationPreviewModal';

interface AIContainerProps {
  /** Whether to hide the FAB (e.g., during active workout) */
  hideFab?: boolean;
  /** Position from bottom of screen for the FAB */
  fabBottom?: number;
}

export function AIContainer({ hideFab = false, fabBottom = 88 }: AIContainerProps) {
  const [showChat, setShowChat] = useState(false);
  const [showMutationPreview, setShowMutationPreview] = useState(false);

  const isConversationOpen = useAIStore((state) => state.isConversationOpen);
  const closeConversation = useAIStore((state) => state.closeConversation);
  const currentMutationPlan = useAIStore((state) => state.currentMutationPlan);
  const loadConversation = useAIStore((state) => state.loadConversation);
  const loadPendingActions = useAIStore((state) => state.loadPendingActions);

  // Load conversation and pending actions on mount
  useEffect(() => {
    loadConversation();
    loadPendingActions();
  }, [loadConversation, loadPendingActions]);

  // Sync modal state with store
  useEffect(() => {
    setShowChat(isConversationOpen);
  }, [isConversationOpen]);

  // Show mutation preview when plan is ready
  useEffect(() => {
    if (currentMutationPlan && showChat) {
      setShowMutationPreview(true);
    }
  }, [currentMutationPlan, showChat]);

  const handleFabPress = () => {
    setShowChat(true);
  };

  const handleChatClose = () => {
    setShowChat(false);
    closeConversation();
  };

  const handleMutationPreviewClose = () => {
    setShowMutationPreview(false);
  };

  const handleMutationConfirm = () => {
    setShowMutationPreview(false);
    // Keep chat open to show success message
  };

  return (
    <>
      {/* FAB Button */}
      <AIFab
        bottom={fabBottom}
        hidden={hideFab}
        onPress={handleFabPress}
      />

      {/* Chat Modal */}
      <AIChatModal
        visible={showChat}
        onClose={handleChatClose}
        onMutationPlanReady={() => setShowMutationPreview(true)}
      />

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
