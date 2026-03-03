// Export types from types/in-app-messaging (public/modular API; Statics re-exported via modular)
export type { InAppMessaging } from './types/in-app-messaging';
export type { FirebaseInAppMessagingTypes } from './types/namespaced';

// Export modular API functions
export * from './modular';

// Export namespaced API
export * from './namespaced';
export { default } from './namespaced';
