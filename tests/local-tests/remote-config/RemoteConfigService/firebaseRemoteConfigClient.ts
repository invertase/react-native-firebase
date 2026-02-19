import {
  getRemoteConfig,
  fetchAndActivate,
  getValue,
  fetchTimeMillis,
  lastFetchStatus,
} from '@react-native-firebase/remote-config';
import type { IRemoteConfigClient } from './types';

type RemoteConfigInstance = ReturnType<typeof getRemoteConfig>;

export function createFirebaseRemoteConfigClient(): IRemoteConfigClient {
  return {
    getRemoteConfig(app: { name: string }) {
      return getRemoteConfig(app as Parameters<typeof getRemoteConfig>[0]);
    },
    fetchAndActivate(remoteConfig: unknown) {
      return fetchAndActivate(remoteConfig as RemoteConfigInstance);
    },
    getValue(remoteConfig: unknown, key: string) {
      return getValue(remoteConfig as RemoteConfigInstance, key);
    },
    lastFetchStatus(remoteConfig: unknown) {
      return lastFetchStatus(remoteConfig as RemoteConfigInstance);
    },
    fetchTimeMillis(remoteConfig: unknown) {
      return fetchTimeMillis(remoteConfig as RemoteConfigInstance);
    },
  };
}
