import { useContext } from 'react';
import { DragDropContext, DragDropContextValue } from '../contexts/DragDropContext';

/**
 * Hook to access the DragDropContext.
 * Must be used within a DragDropProvider.
 */
export function useDragDropContext(): DragDropContextValue {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDropContext must be used within a DragDropProvider');
  }
  return context;
}

/**
 * Optional version that returns null if not within provider.
 * Useful for components that may be used outside the drag-drop context.
 */
export function useDragDropContextOptional(): DragDropContextValue | null {
  return useContext(DragDropContext);
}
