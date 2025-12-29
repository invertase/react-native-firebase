// shared between namespaced and modular API

import {
  AuthorizationStatus as AuthorizationStatusEnum,
  NotificationAndroidPriority as NotificationAndroidPriorityEnum,
  NotificationAndroidVisibility as NotificationAndroidVisibilityEnum,
} from './types/messaging';

// Export as objects for runtime use (matching the old statics.js pattern)
export const AuthorizationStatus = {
  NOT_DETERMINED: AuthorizationStatusEnum.NOT_DETERMINED,
  DENIED: AuthorizationStatusEnum.DENIED,
  AUTHORIZED: AuthorizationStatusEnum.AUTHORIZED,
  PROVISIONAL: AuthorizationStatusEnum.PROVISIONAL,
  EPHEMERAL: AuthorizationStatusEnum.EPHEMERAL,
} as const;

export const NotificationAndroidPriority = {
  PRIORITY_MIN: NotificationAndroidPriorityEnum.PRIORITY_MIN,
  PRIORITY_LOW: NotificationAndroidPriorityEnum.PRIORITY_LOW,
  PRIORITY_DEFAULT: NotificationAndroidPriorityEnum.PRIORITY_DEFAULT,
  PRIORITY_HIGH: NotificationAndroidPriorityEnum.PRIORITY_HIGH,
  PRIORITY_MAX: NotificationAndroidPriorityEnum.PRIORITY_MAX,
} as const;

export const NotificationAndroidVisibility = {
  VISIBILITY_SECRET: NotificationAndroidVisibilityEnum.VISIBILITY_SECRET,
  VISIBILITY_PRIVATE: NotificationAndroidVisibilityEnum.VISIBILITY_PRIVATE,
  VISIBILITY_PUBLIC: NotificationAndroidVisibilityEnum.VISIBILITY_PUBLIC,
} as const;
