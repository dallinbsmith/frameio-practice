export type FeatureFlag = {
  key: string;
  enabled: boolean;
  description?: string;
  enabledFor?: string[];
  percentage?: number;
  metadata?: Record<string, unknown>;
};

export type FeatureFlagsConfig = {
  flags: Record<string, FeatureFlag>;
  userId?: string;
  overrides?: Record<string, boolean>;
};

export type FeatureFlagsContextValue = {
  isEnabled: (key: string) => boolean;
  getFlag: (key: string) => FeatureFlag | undefined;
  getAllFlags: () => Record<string, FeatureFlag>;
  setOverride: (key: string, enabled: boolean) => void;
  clearOverrides: () => void;
};
