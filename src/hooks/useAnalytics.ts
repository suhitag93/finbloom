import posthog from "posthog-js";

// No PII — only behavioral and progress data
type AnalyticsProperties = Record<string, string | number | boolean | string[] | undefined>;

export const useAnalytics = () => {
  const track = (event: string, properties?: AnalyticsProperties) => {
    if (posthog.__loaded) {
      posthog.capture(event, properties);
    }
  };

  const identify = (userId: string, properties?: AnalyticsProperties) => {
    if (posthog.__loaded) {
      posthog.identify(userId, properties);
    }
  };

  const reset = () => {
    if (posthog.__loaded) {
      posthog.reset();
    }
  };

  return { track, identify, reset };
};
