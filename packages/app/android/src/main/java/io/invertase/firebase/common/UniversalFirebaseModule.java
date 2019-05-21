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

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import javax.annotation.OverridingMethodsMustInvokeSuper;

public class UniversalFirebaseModule {
  private static Map<String, ExecutorService> executors = new HashMap<>();

  private final Context context;
  private final String serviceName;

  protected UniversalFirebaseModule(Context context, String serviceName) {
    this.context = context;
    this.serviceName = serviceName;
  }

  public Context getContext() {
    return context;
  }

  public Context getApplicationContext() {
    return getContext().getApplicationContext();
  }

  protected ExecutorService getExecutor() {
    ExecutorService existingSingleThreadExecutor = executors.get(getName());
    if (existingSingleThreadExecutor != null) return existingSingleThreadExecutor;
    ExecutorService newSingleThreadExecutor = Executors.newSingleThreadExecutor();
    executors.put(getName(), newSingleThreadExecutor);
    return newSingleThreadExecutor;
  }

  public String getName() {
    return "Universal" + serviceName + "Module";
  }

  @OverridingMethodsMustInvokeSuper
  public void onTearDown() {
    ExecutorService existingSingleThreadExecutor = executors.get(getName());
    if (existingSingleThreadExecutor != null) {
      existingSingleThreadExecutor.shutdownNow();
      executors.remove(getName());
    }
  }

  public Map<String, Object> getConstants() {
    return new HashMap<>();
  }
}
