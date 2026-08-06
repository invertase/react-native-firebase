// Authorization and notification statics for modular API exports

/**
 * Authorization status values returned by the deprecated permission APIs.
 *
 * @deprecated Use {@link https://github.com/zoontek/react-native-permissions react-native-permissions} or
 * {@link https://docs.expo.dev/versions/latest/sdk/notifications/ expo-notifications} for notification permission
 * requests instead. These APIs will be removed in a future major release.
 * See {@link https://github.com/invertase/react-native-firebase/issues/6283 #6283}.
 */
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
