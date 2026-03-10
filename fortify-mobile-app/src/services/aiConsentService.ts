import { Alert } from 'react-native';
import { AI_DATA_SHARING_CONSENT_KEY } from '@/src/constants/storageKeys';
import { getScopedItem, setScopedItem } from '@/src/utils/scopedStorage';

type AIDataSharingConsentDecision = 'granted' | 'declined';

interface AIDataSharingConsentRecord {
  decision: AIDataSharingConsentDecision;
  version: number;
  updatedAt: string;
}

const AI_DATA_SHARING_CONSENT_VERSION = 1;

export const AI_DATA_SHARING_DISCLOSURE =
  'Fortify can share your data with OpenAI to generate AI coaching responses.\n\n'
  + 'Data shared may include:\n'
  + '- prompts and chat history\n'
  + '- goals and training preferences\n'
  + '- workout, analytics, and insight context tied to your account';

const parseConsentRecord = (raw: string | null): AIDataSharingConsentRecord | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AIDataSharingConsentRecord>;
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.version !== AI_DATA_SHARING_CONSENT_VERSION) return null;
    if (parsed.decision !== 'granted' && parsed.decision !== 'declined') return null;
    if (typeof parsed.updatedAt !== 'string') return null;
    return {
      decision: parsed.decision,
      version: parsed.version,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
};

export const getAIDataSharingConsentDecision = async (): Promise<AIDataSharingConsentDecision | null> => {
  const raw = await getScopedItem(AI_DATA_SHARING_CONSENT_KEY);
  const record = parseConsentRecord(raw);
  return record?.decision ?? null;
};

export const hasAIDataSharingConsent = async (): Promise<boolean> => {
  const decision = await getAIDataSharingConsentDecision();
  return decision === 'granted';
};

export const setAIDataSharingConsent = async (granted: boolean): Promise<void> => {
  const record: AIDataSharingConsentRecord = {
    decision: granted ? 'granted' : 'declined',
    version: AI_DATA_SHARING_CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
  };
  await setScopedItem(AI_DATA_SHARING_CONSENT_KEY, JSON.stringify(record));
};

export const requestAIDataSharingConsent = async (): Promise<boolean> => {
  const existingConsent = await hasAIDataSharingConsent();
  if (existingConsent) {
    return true;
  }

  return await new Promise<boolean>((resolve) => {
    Alert.alert(
      'Allow AI data sharing?',
      `${AI_DATA_SHARING_DISCLOSURE}\n\nYou can change this anytime in Settings.`,
      [
        {
          text: 'Not Now',
          style: 'cancel',
          onPress: () => {
            void setAIDataSharingConsent(false);
            resolve(false);
          },
        },
        {
          text: 'Allow',
          onPress: () => {
            void setAIDataSharingConsent(true);
            resolve(true);
          },
        },
      ]
    );
  });
};
