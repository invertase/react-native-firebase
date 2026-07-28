package io.invertase.firebase.database;

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

import androidx.annotation.CallSuper;
import io.invertase.firebase.common.TaskExecutorService;
import java.util.concurrent.ExecutorService;

/**
 * Shared executor helpers for Database TurboModule shells (replaces ReactNativeFirebaseModule
 * inheritance when extending generated *Spec classes).
 */
final class DatabaseTurboModuleSupport {
  private final TaskExecutorService executorService;

  DatabaseTurboModuleSupport(String moduleName) {
    executorService = new TaskExecutorService(moduleName);
  }

  ExecutorService getExecutor() {
    return executorService.getExecutor();
  }

  ExecutorService getTransactionalExecutor() {
    return executorService.getTransactionalExecutor();
  }

  ExecutorService getTransactionalExecutor(String identifier) {
    return executorService.getTransactionalExecutor(identifier);
  }

  void removeEventListeningExecutor(String identifier) {
    String executorName = executorService.getExecutorName(true, identifier);
    executorService.removeExecutor(executorName);
  }

  @CallSuper
  void invalidate() {
    executorService.shutdown();
  }
}
