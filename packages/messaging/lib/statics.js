// shared between namespaced and modular API

export const AuthorizationStatus = {
  NOT_DETERMINED: -1,
  DENIED: 0,
  AUTHORIZED: 1,
  PROVISIONAL: 2,
  EPHEMERAL: 3,
};
export const NotificationAndroidPriority = {
  PRIORITY_MIN: -2,
  PRIORITY_LOW: -1,
  PRIORITY_DEFAULT: 0,
  PRIORITY_HIGH: 1,
  PRIORITY_MAX: 2,
};
export const NotificationAndroidVisibility = {
  VISIBILITY_SECRET: -1,
  VISIBILITY_PRIVATE: 0,
  VISIBILITY_PUBLIC: 1,
};
