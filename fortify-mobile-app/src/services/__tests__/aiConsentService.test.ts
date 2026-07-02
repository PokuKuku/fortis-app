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

  it('re-prompts after a decline when forcePrompt is enabled', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      buttons?.find((button) => button.text === 'Allow')?.onPress?.();
    });
    await setAIDataSharingConsent(false);

    await expect(requestAIDataSharingConsent({ forcePrompt: true })).resolves.toBe(true);

    expect(alertSpy).toHaveBeenCalledWith(
      'Allow AI coaching?',
      expect.any(String),
      expect.any(Array)
    );

    alertSpy.mockRestore();
  });
});
