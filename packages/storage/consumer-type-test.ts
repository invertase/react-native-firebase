/*
 * Consumer-facing type tests for @react-native-firebase/storage.
 *
 * The storage types import `CompleteFn`, `NextFn` and `Unsubscribe` from
 * `@react-native-firebase/app/dist/module/types/common`. An app resolves that
 * subpath through the app package's `exports` map, so this config has no
 * `paths` alias for it. If the subpath is not exported, `skipLibCheck` hides
 * the TS2307 in the declaration file and the types silently accept anything.
 * Each `@ts-expect-error` below then has no error to expect, which fails the
 * compile.
 */

import type { UploadTask, Unsubscribe, NextFn, CompleteFn } from '@react-native-firebase/storage';
import { TaskEvent } from '@react-native-firebase/storage';

// @ts-expect-error Unsubscribe is a function type
const unsubscribeIsTyped: Unsubscribe = 1;
// @ts-expect-error NextFn is a function type
const nextFnIsTyped: NextFn<string> = 1;
// @ts-expect-error CompleteFn is a function type
const completeFnIsTyped: CompleteFn = 1;

declare const task: UploadTask;
const unsubscribe = task.on(TaskEvent.STATE_CHANGED, () => {});
// @ts-expect-error `on()` with a listener returns a function, not a string
const onResultIsTyped: string = unsubscribe;

void unsubscribeIsTyped;
void nextFnIsTyped;
void completeFnIsTyped;
void onResultIsTyped;
