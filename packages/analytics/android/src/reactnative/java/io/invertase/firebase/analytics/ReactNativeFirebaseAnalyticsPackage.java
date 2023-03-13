package io.invertase.firebase.analytics;

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

import androidx.annotation.Nullable;

import com.facebook.react.TurboReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfo;
import com.facebook.react.module.model.ReactModuleInfoProvider;

import java.util.HashMap;
import java.util.Map;

import io.invertase.firebase.common.ReactNativeFirebaseModule;

@SuppressWarnings("unused")
public class ReactNativeFirebaseAnalyticsPackage extends TurboReactPackage {

  @Nullable
  @Override
  public NativeModule getModule(String name, ReactApplicationContext reactApplicationContext) {
    if (name.equals(ReactNativeFirebaseModule.getModuleName(ReactNativeFirebaseAnalyticsModuleImpl.SERVICE_NAME))) {
      return new ReactNativeFirebaseAnalyticsModule(reactApplicationContext);
    } else {
      return null;
    }
  }

  @Override
  public ReactModuleInfoProvider getReactModuleInfoProvider() {
    String analyticsModuleName = ReactNativeFirebaseModule.getModuleName(ReactNativeFirebaseAnalyticsModuleImpl.SERVICE_NAME);

    return () -> {
      boolean isTurboModule = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
      final Map<String, ReactModuleInfo> moduleInfo = new HashMap<>();
      moduleInfo.put(
        analyticsModuleName,
        new ReactModuleInfo(
          analyticsModuleName,
          analyticsModuleName,
          false, // canOverrideExistingModule
          false, // needsEagerInit
          false, // hasConstants
          false, // isCxxModule
          isTurboModule // isTurboModule
        ));

      return moduleInfo;
    };
  }
}
