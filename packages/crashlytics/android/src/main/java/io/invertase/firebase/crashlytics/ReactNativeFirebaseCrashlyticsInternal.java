package io.invertase.firebase.crashlytics;

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
import com.google.firebase.crashlytics.FirebaseCrashlytics;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Objects;
import java.util.concurrent.Callable;

/**
 * Reaches Firebase Crashlytics SDK internals that have no public API.
 *
 * <p>{@code recordException} queues its event on the {@code common} worker, which then queues the
 * event write on the {@code diskWrite} worker. Both workers are serial, so a {@code common} task
 * that itself queues a no-op on {@code diskWrite} completes only after every event write already
 * queued by earlier {@code recordException} calls.
 *
 * <p>Apps can override the Firebase BoM, so every internal member is reached by reflection: an SDK
 * without them still builds, and any mismatch throws at runtime. Callers must treat every failure
 * as "barrier unavailable". The reflected members are kept by the package's consumer R8/ProGuard
 * rules ({@code proguard-rules.pro}); keep both lists in sync.
 */
final class ReactNativeFirebaseCrashlyticsInternal {
  static final String CORE_FIELD = "core";
  static final String WORKERS_FIELD = "crashlyticsWorkers";
  static final String COMMON_FIELD = "common";
  static final String DISK_WRITE_FIELD = "diskWrite";
  static final String SUBMIT_TASK_METHOD = "submitTask";
  static final String SUBMIT_METHOD = "submit";

  private ReactNativeFirebaseCrashlyticsInternal() {}

  /** Returns a task that completes after all event writes already queued by the SDK. */
  static Task<?> pendingEventWritesBarrier(FirebaseCrashlytics crashlytics)
      throws ReflectiveOperationException {
    return barrierOn(read(read(crashlytics, CORE_FIELD), WORKERS_FIELD));
  }

  /** {@code workers.common.submitTask(() -> workers.diskWrite.submit(() -> {}))}, reflectively. */
  static Task<?> barrierOn(Object workers) throws ReflectiveOperationException {
    Object common = read(workers, COMMON_FIELD);
    Object diskWrite = read(workers, DISK_WRITE_FIELD);
    Method submit = diskWrite.getClass().getMethod(SUBMIT_METHOD, Runnable.class);
    Method submitTask = common.getClass().getMethod(SUBMIT_TASK_METHOD, Callable.class);
    Runnable noop = () -> {};
    Callable<Object> queueNoopOnDiskWrite = () -> submit.invoke(diskWrite, noop);
    return (Task<?>) submitTask.invoke(common, queueNoopOnDiskWrite);
  }

  /** Reads field {@code name} declared on {@code owner}'s class or a superclass; never null. */
  static Object read(Object owner, String name) throws ReflectiveOperationException {
    for (Class<?> type = owner.getClass(); type != null; type = type.getSuperclass()) {
      try {
        Field field = type.getDeclaredField(name);
        field.setAccessible(true);
        return Objects.requireNonNull(field.get(owner), name);
      } catch (NoSuchFieldException notDeclaredHere) {
        // Keep looking up the hierarchy (e.g. a subclass of the SDK type).
      }
    }
    throw new NoSuchFieldException(name);
  }
}
