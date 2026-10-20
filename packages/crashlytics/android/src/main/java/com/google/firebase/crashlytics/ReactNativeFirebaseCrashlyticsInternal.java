package com.google.firebase.crashlytics;

/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import com.google.android.gms.tasks.Task;
import com.google.firebase.crashlytics.internal.common.CrashlyticsCore;
import com.google.firebase.crashlytics.internal.concurrency.CrashlyticsWorkers;
import java.lang.reflect.Field;
import java.util.Objects;

/**
 * Reaches Firebase Crashlytics SDK internals that have no public API. Lives in the SDK's package so
 * it can read the package-private {@code FirebaseCrashlytics.core} field.
 *
 * <p>{@code recordException} queues its event on the {@code common} worker, which then queues the
 * event write on the {@code diskWrite} worker. Both workers are serial, so a {@code common} task
 * that itself queues a no-op on {@code diskWrite} completes only after every event write already
 * queued by earlier {@code recordException} calls.
 *
 * <p>Any SDK shape change surfaces as an exception (or {@link LinkageError}); callers must treat
 * every failure as "barrier unavailable". The reflected field is kept by the package's consumer
 * R8/ProGuard rules; lookup also falls back to the field's type in case it was renamed.
 */
public final class ReactNativeFirebaseCrashlyticsInternal {
  static final String WORKERS_FIELD_NAME = "crashlyticsWorkers";

  private ReactNativeFirebaseCrashlyticsInternal() {}

  /** Returns a task that completes after all event writes already queued by the SDK. */
  public static Task<Void> pendingEventWritesBarrier(FirebaseCrashlytics crashlytics)
      throws ReflectiveOperationException {
    CrashlyticsWorkers workers = workersOf(crashlytics.core);
    return workers.common.submitTask(() -> workers.diskWrite.submit(() -> {}));
  }

  static CrashlyticsWorkers workersOf(CrashlyticsCore core) throws ReflectiveOperationException {
    Field field = findField(CrashlyticsCore.class, WORKERS_FIELD_NAME, CrashlyticsWorkers.class);
    field.setAccessible(true);
    return (CrashlyticsWorkers) Objects.requireNonNull(field.get(Objects.requireNonNull(core)));
  }

  static Field findField(Class<?> owner, String name, Class<?> type) throws NoSuchFieldException {
    try {
      return owner.getDeclaredField(name);
    } catch (NoSuchFieldException notFoundByName) {
      for (Field field : owner.getDeclaredFields()) {
        if (field.getType() == type) {
          return field;
        }
      }
      throw notFoundByName;
    }
  }
}
