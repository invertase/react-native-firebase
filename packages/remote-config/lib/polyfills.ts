// @ts-expect-error - react-native internal module may lack types
import { polyfillGlobal } from 'react-native/Libraries/Utilities/PolyfillFunctions';
// @ts-expect-error - web-streams-polyfill ponyfill may lack types
import { ReadableStream } from 'web-streams-polyfill/dist/ponyfill';
// @ts-expect-error - react-native-fetch-api may lack types
import { fetch, Headers, Request, Response } from 'react-native-fetch-api';

polyfillGlobal(
  'fetch',
  () =>
    (...args: Parameters<typeof fetch>) =>
      fetch(args[0], { ...args[1], reactNative: { textStreaming: true } } as RequestInit),
);
polyfillGlobal('Headers', () => Headers);
polyfillGlobal('Request', () => Request);
polyfillGlobal('Response', () => Response);
polyfillGlobal('ReadableStream', () => ReadableStream);

import 'text-encoding';
