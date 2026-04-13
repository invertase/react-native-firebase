import type {
  LastFetchStatus as LastFetchStatusType,
  ValueSource as ValueSourceType,
} from './types/remote-config';

export const LastFetchStatus = {
  SUCCESS: 'success',
  FAILURE: 'failure',
  THROTTLED: 'throttled',
  NO_FETCH_YET: 'no_fetch_yet',
} as const satisfies LastFetchStatusType;

export const ValueSource = {
  REMOTE: 'remote',
  DEFAULT: 'default',
  STATIC: 'static',
} as const satisfies ValueSourceType;
