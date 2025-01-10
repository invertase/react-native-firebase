// @ts-ignore
import { polyfill } from 'react-native-polyfill-globals/src/fetch';
polyfill();

// @ts-ignore
import { ReadableStream as ReadableStreamPolyfill } from 'web-streams-polyfill/dist/ponyfill';
// @ts-ignore
globalThis.ReadableStream = ReadableStreamPolyfill;

import 'text-encoding';
