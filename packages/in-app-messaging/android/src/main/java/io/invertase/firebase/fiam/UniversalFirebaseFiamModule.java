package io.invertase.firebase.fiam;

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
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.inappmessaging.FirebaseInAppMessaging;
import io.invertase.firebase.common.UniversalFirebaseModule;
import java.util.HashMap;
import java.util.Map;

public class UniversalFirebaseFiamModule extends UniversalFirebaseModule {

  UniversalFirebaseFiamModule(Context context, String serviceName) {
    super(context, serviceName);
  }

  Task<Void> setAutomaticDataCollectionEnabled(Boolean enabled) {
    return Tasks.call(
        () -> {
          FirebaseInAppMessaging.getInstance().setAutomaticDataCollectionEnabled(enabled);
          return null;
        });
  }

  Task<Void> setMessagesDisplaySuppressed(Boolean enabled) {
    return Tasks.call(
        () -> {
          FirebaseInAppMessaging.getInstance().setMessagesSuppressed(enabled);
          return null;
        });
  }

  Task<Void> triggerEvent(String eventId) {
    return Tasks.call(
        () -> {
          FirebaseInAppMessaging.getInstance().triggerEvent(eventId);
          return null;
        });
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put(
        "isMessagesDisplaySuppressed",
        FirebaseInAppMessaging.getInstance().areMessagesSuppressed());
    constants.put(
        "isAutomaticDataCollectionEnabled",
        FirebaseInAppMessaging.getInstance().isAutomaticDataCollectionEnabled());
    return constants;
  }
}
