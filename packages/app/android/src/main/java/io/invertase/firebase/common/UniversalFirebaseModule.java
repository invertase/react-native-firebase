package io.invertase.firebase.common;

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

import android.content.Context;
import io.invertase.firebase.common.TaskExecutorService;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;

import javax.annotation.OverridingMethodsMustInvokeSuper;

public class UniversalFirebaseModule {
  private final TaskExecutorService executorService;

  private final Context context;
  private final String serviceName;

  protected UniversalFirebaseModule(Context context, String serviceName) {
    this.context = context;
    this.serviceName = serviceName;
    this.executorService = new TaskExecutorService(getName());
  }

  public Context getContext() {
    return context;
  }

  public Context getApplicationContext() {
    return getContext().getApplicationContext();
  }

  protected ExecutorService getExecutor() {
    return executorService.getExecutor();
  }

  public String getName() {
    return "Universal" + serviceName + "Module";
  }

  @OverridingMethodsMustInvokeSuper
  public void onTearDown() {
    executorService.shutdown();
  }

  public Map<String, Object> getConstants() {
    return new HashMap<>();
  }
}
