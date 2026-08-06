import type { ValueSource as ValueSourceType } from './types/remote-config';

interface LastFetchStatusStatics {
  SUCCESS: 'success';
  FAILURE: 'failure';
  THROTTLED: 'throttled';
  NO_FETCH_YET: 'no_fetch_yet';
}

interface ValueSourceStatics {
  REMOTE: ValueSourceType;
  DEFAULT: ValueSourceType;
  STATIC: ValueSourceType;
}

export const LastFetchStatus = {
  SUCCESS: 'success',
  FAILURE: 'failure',
  THROTTLED: 'throttled',
  NO_FETCH_YET: 'no_fetch_yet',
} as const satisfies LastFetchStatusStatics;

export const ValueSource = {
  REMOTE: 'remote',
  DEFAULT: 'default',
  STATIC: 'static',
} as const satisfies ValueSourceStatics;
