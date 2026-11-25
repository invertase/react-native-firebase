/*
 * Consumer-facing type tests for @react-native-firebase/app-check.
 *
 * `Unsubscribe` and `PartialObserver` are re-exported from
 * `@react-native-firebase/app/dist/module/types/common`, which an app resolves
 * through the app package's `exports` map. If that subpath is not exported,
 * `skipLibCheck` hides the TS2307 in the declaration file and the types
 * silently accept anything. Each `@ts-expect-error` below then has no error to
 * expect, which fails the compile.
 */

import type { PartialObserver, Unsubscribe } from '@react-native-firebase/app-check';

// @ts-expect-error Unsubscribe is a function type
const unsubscribeIsTyped: Unsubscribe = 1;
// @ts-expect-error PartialObserver is an object type
const partialObserverIsTyped: PartialObserver<string> = 1;

void unsubscribeIsTyped;
void partialObserverIsTyped;
