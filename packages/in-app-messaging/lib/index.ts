// Export types from types/in-app-messaging
export type {
  InAppMessaging,
  Statics,
  FirebaseInAppMessagingTypes,
} from './types/in-app-messaging';

// Export modular API functions
export * from './modular';

// Export namespaced API
export * from './namespaced';
export { default } from './namespaced';
