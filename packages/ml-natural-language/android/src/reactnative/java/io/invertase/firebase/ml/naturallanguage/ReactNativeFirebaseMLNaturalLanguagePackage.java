package io.invertase.firebase.ml.naturallanguage;

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

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import javax.annotation.Nonnull;

import io.invertase.firebase.common.ReactNativeFirebaseJSON;

@SuppressWarnings("unused")
public class ReactNativeFirebaseMLNaturalLanguagePackage implements ReactPackage {
  @Nonnull
  @Override
  public List<NativeModule> createNativeModules(@Nonnull ReactApplicationContext reactContext) {
    List<NativeModule> modules = new ArrayList<>();

    if (ReactNativeFirebaseJSON
      .getSharedInstance()
      .getBooleanValue("ml_natural_language_language_id_model", false)) {
      modules.add(new RNFirebaseMLNaturalLanguageIdModule(reactContext));
    }

    if (ReactNativeFirebaseJSON
      .getSharedInstance()
      .getBooleanValue("ml_natural_language_translate_model", false)) {
      modules.add(new RNFirebaseMLNaturalLanguageTranslateModule(reactContext));
    }

    if (ReactNativeFirebaseJSON
      .getSharedInstance()
      .getBooleanValue("ml_natural_language_smart_reply_model", false)) {
      modules.add(new RNFirebaseMLNaturalLanguageSmartReplyModule(reactContext));
    }

    return modules;
  }

  @Nonnull
  @Override
  public List<ViewManager> createViewManagers(@Nonnull ReactApplicationContext reactContext) {
    return Collections.emptyList();
  }
}
