import { trackMixpanelEvent } from '@/src/lib/mixpanel';

export async function trackAnonymousMixpanelEvent(
  eventName: string,
  properties: Record<string, unknown>
): Promise<void> {
  await trackMixpanelEvent(eventName, properties);
}
