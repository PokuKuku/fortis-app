import { IN_APP_TOUR_STATE_KEY } from '@/src/constants/storageKeys';
import { getScopedItem, removeScopedItem, setScopedItem } from '@/src/utils/scopedStorage';

export type InAppTourStatus = 'in_progress' | 'completed' | 'skipped';

export type PersistedInAppTourState = {
  version: number;
  status: InAppTourStatus;
  stepId: string;
  updatedAt: string;
};

const isValidStatus = (value: unknown): value is InAppTourStatus =>
  value === 'in_progress' || value === 'completed' || value === 'skipped';

export const parseInAppTourState = (raw: string | null): PersistedInAppTourState | null => {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedInAppTourState>;
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.version !== 'number') return null;
    if (!isValidStatus(parsed.status)) return null;
    if (typeof parsed.stepId !== 'string' || parsed.stepId.length === 0) return null;
    if (typeof parsed.updatedAt !== 'string' || parsed.updatedAt.length === 0) return null;
    return parsed as PersistedInAppTourState;
  } catch {
    return null;
  }
};

export async function loadInAppTourState(): Promise<PersistedInAppTourState | null> {
  const raw = await getScopedItem(IN_APP_TOUR_STATE_KEY);
  return parseInAppTourState(raw);
}

export async function saveInAppTourState(state: PersistedInAppTourState): Promise<void> {
  await setScopedItem(IN_APP_TOUR_STATE_KEY, JSON.stringify(state));
}

export async function clearInAppTourState(): Promise<void> {
  await removeScopedItem(IN_APP_TOUR_STATE_KEY);
}

