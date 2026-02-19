import type { FirebaseRemoteConfigTypes } from './types/namespaced';

export const LastFetchStatus: FirebaseRemoteConfigTypes.LastFetchStatus = {
  SUCCESS: 'success',
  FAILURE: 'failure',
  THROTTLED: 'throttled',
  NO_FETCH_YET: 'no_fetch_yet',
};

export const ValueSource: FirebaseRemoteConfigTypes.ValueSource = {
  REMOTE: 'remote',
  DEFAULT: 'default',
  STATIC: 'static',
};
