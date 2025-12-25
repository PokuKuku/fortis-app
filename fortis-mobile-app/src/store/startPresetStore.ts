import { create } from 'zustand';
import { getScopedItem, removeScopedItem, setScopedItem } from '@/src/utils/scopedStorage';
import { START_BUTTON_PRESET_KEY } from '@/src/constants/storageKeys';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';

export type StartPresetType = 'blank' | 'template' | 'program';

export type StartPreset =
  | { type: 'blank' }
  | { type: 'template'; templateId?: string; templateWorkoutId?: string }
  | { type: 'program'; programId: string };

interface StartPresetState {
  preset: StartPreset | null;
  isLoaded: boolean;
  isSyncing: boolean;
  loadPreset: () => Promise<void>;
  setPreset: (preset: StartPreset | null) => Promise<void>;
  migrateLocalId: (localId: string, serverId: string) => void;
  resetStore: () => void;
}

const isValidUUID = (value?: string | null): boolean => {
  if (!value) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

const parsePreset = (raw: string | null): StartPreset | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StartPreset;
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.type === 'blank') return { type: 'blank' };
    if (parsed.type === 'program' && parsed.programId) {
      return { type: 'program', programId: parsed.programId };
    }
    if (parsed.type === 'template') {
      return {
        type: 'template',
        templateId: parsed.templateId,
        templateWorkoutId: parsed.templateWorkoutId,
      };
    }
    return null;
  } catch (error) {
    console.warn('Failed to parse start preset:', error);
    return null;
  }
};

const buildPresetFromProfile = (profile: {
  default_start_type?: string | null;
  default_start_template_id?: string | null;
  default_start_program_id?: string | null;
}): StartPreset | null => {
  if (profile.default_start_type === 'blank') {
    return { type: 'blank' };
  }
  if (profile.default_start_type === 'template' && profile.default_start_template_id) {
    return { type: 'template', templateWorkoutId: profile.default_start_template_id };
  }
  if (profile.default_start_type === 'program' && profile.default_start_program_id) {
    return { type: 'program', programId: profile.default_start_program_id };
  }
  return null;
};

const buildProfileUpdate = (preset: StartPreset | null) => {
  if (!preset) {
    return {
      default_start_type: null,
      default_start_template_id: null,
      default_start_program_id: null,
    };
  }
  if (preset.type === 'blank') {
    return {
      default_start_type: 'blank',
      default_start_template_id: null,
      default_start_program_id: null,
    };
  }
  if (preset.type === 'program') {
    return {
      default_start_type: 'program',
      default_start_template_id: null,
      default_start_program_id: preset.programId,
    };
  }
  return {
    default_start_type: 'template',
    default_start_template_id: preset.templateWorkoutId ?? null,
    default_start_program_id: null,
  };
};

const canSyncPreset = (preset: StartPreset | null): boolean => {
  if (!preset) return true;
  if (preset.type === 'blank') return true;
  if (preset.type === 'program') return isValidUUID(preset.programId);
  return isValidUUID(preset.templateWorkoutId);
};

export const useStartPresetStore = create<StartPresetState>((set, get) => ({
  preset: null,
  isLoaded: false,
  isSyncing: false,

  loadPreset: async () => {
    const localRaw = await getScopedItem(START_BUTTON_PRESET_KEY);
    const localPreset = parsePreset(localRaw);
    if (localPreset) {
      set({ preset: localPreset });
    }

    if (!isSupabaseConfigured()) {
      set({ isLoaded: true });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        set({ isLoaded: true });
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('default_start_type, default_start_template_id, default_start_program_id')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.warn('Failed to load start preset from profile:', error.message);
        set({ isLoaded: true });
        return;
      }

      const remotePreset = buildPresetFromProfile(data ?? {});
      if (remotePreset) {
        set({ preset: remotePreset });
        await setScopedItem(START_BUTTON_PRESET_KEY, JSON.stringify(remotePreset));
        set({ isLoaded: true });
        return;
      }

      if (localPreset && canSyncPreset(localPreset)) {
        await get().setPreset(localPreset);
      }
    } catch (error) {
      console.warn('Failed to sync start preset:', error);
    }

    set({ isLoaded: true });
  },

  setPreset: async (preset) => {
    set({ preset, isSyncing: true });

    if (preset) {
      await setScopedItem(START_BUTTON_PRESET_KEY, JSON.stringify(preset));
    } else {
      await removeScopedItem(START_BUTTON_PRESET_KEY);
    }

    if (!isSupabaseConfigured() || !canSyncPreset(preset)) {
      set({ isSyncing: false });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        set({ isSyncing: false });
        return;
      }

      const updates = buildProfileUpdate(preset);
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', session.user.id);

      if (error) {
        console.warn('Failed to sync start preset to profile:', error.message);
      }
    } catch (error) {
      console.warn('Failed to sync start preset to profile:', error);
    } finally {
      set({ isSyncing: false });
    }
  },

  migrateLocalId: (localId, serverId) => {
    const current = get().preset;
    if (!current) return;

    if (current.type === 'program' && current.programId === localId) {
      void get().setPreset({ type: 'program', programId: serverId });
      return;
    }

    if (current.type === 'template' && current.templateId === localId) {
      void get().setPreset({
        type: 'template',
        templateId: serverId,
        templateWorkoutId: current.templateWorkoutId,
      });
    }
  },

  resetStore: () => {
    set({ preset: null, isLoaded: false, isSyncing: false });
  },
}));
