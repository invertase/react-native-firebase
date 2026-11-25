/*
 * Consumer-facing type tests for @react-native-firebase/messaging.
 *
 * `Observer` uses `ErrorFn` and `CompleteFn` from
 * `@react-native-firebase/app/dist/module/types/common`, which an app resolves
 * through the app package's `exports` map. If that subpath is not exported,
 * `skipLibCheck` hides the TS2307 in the declaration file and those members
 * silently accept anything. Each `@ts-expect-error` below then has no error to
 * expect, which fails the compile.
 */

import type { Observer } from '@react-native-firebase/messaging';

declare const observer: Observer<string>;

// @ts-expect-error `error` is an ErrorFn, not a string
const errorIsTyped: string = observer.error;
// @ts-expect-error `complete` is a CompleteFn, not a string
const completeIsTyped: string = observer.complete;

void errorIsTyped;
void completeIsTyped;
