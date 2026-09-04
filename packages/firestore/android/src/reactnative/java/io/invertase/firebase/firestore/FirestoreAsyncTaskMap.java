package io.invertase.firebase.firestore;

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

import com.google.android.gms.tasks.Continuation;
import com.google.android.gms.tasks.Task;
import java.util.concurrent.Executor;

/**
 * Maps Play Services {@link Task} results without blocking a shared executor thread.
 *
 * <p>Prefer {@link Task#continueWith(Executor, Continuation)} over {@code Tasks.call} + {@code
 * Tasks.await}: an unbounded await on a single-thread module executor permanently wedges later work
 * when the upstream Task never completes (for example a Firestore get orphaned across Auth
 * sign-out).
 */
final class FirestoreAsyncTaskMap {
  private FirestoreAsyncTaskMap() {}

  static <TIn, TOut> Task<TOut> map(
      Task<TIn> upstream, Executor executor, Continuation<TIn, TOut> continuation) {
    return upstream.continueWith(executor, continuation);
  }
}
