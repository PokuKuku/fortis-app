const posthogApiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? '';
const posthogHost = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com';

const isPostHogConfigured = () => Boolean(posthogApiKey);

export { posthogApiKey, posthogHost, isPostHogConfigured };
