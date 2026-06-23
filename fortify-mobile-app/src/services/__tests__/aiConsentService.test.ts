import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  requestAIDataSharingConsent,
  setAIDataSharingConsent,
} from '@/src/services/aiConsentService';

describe('aiConsentService', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('does not re-prompt after a user declines AI data sharing', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    await setAIDataSharingConsent(false);

    await expect(requestAIDataSharingConsent()).resolves.toBe(false);
    expect(alertSpy).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });
});
