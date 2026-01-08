// shared between namespaced and modular API

// Export as objects for runtime use (matching the old statics.js pattern)
export const AuthorizationStatus = {
  NOT_DETERMINED: -1,
  DENIED: 0,
  AUTHORIZED: 1,
  PROVISIONAL: 2,
  EPHEMERAL: 3,
} as const;

export const NotificationAndroidPriority = {
  PRIORITY_MIN: -2,
  PRIORITY_LOW: -1,
  PRIORITY_DEFAULT: 0,
  PRIORITY_HIGH: 1,
  PRIORITY_MAX: 2,
} as const;

export const NotificationAndroidVisibility = {
  VISIBILITY_SECRET: -1,
  VISIBILITY_PRIVATE: 0,
  VISIBILITY_PUBLIC: 1,
} as const;
