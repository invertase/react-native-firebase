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

import android.app.Activity;
import android.content.Context;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

import java.util.HashMap;
import java.util.Map;

import io.invertase.firebase.interfaces.ContextProvider;

public class ReactNativeFirebaseModule extends ReactContextBaseJavaModule implements ContextProvider {
  private String moduleName;
  private Boolean withEventEmitter;
  private ReactNativeFirebaseEventEmitter eventEmitter;

  public ReactNativeFirebaseModule(
    ReactApplicationContext reactContext,
    String moduleName,
    Boolean withEventEmitter
  ) {
    super(reactContext);
    this.moduleName = moduleName;
    this.withEventEmitter = withEventEmitter;
    if (withEventEmitter) {
      this.eventEmitter = new ReactNativeFirebaseEventEmitter();
    }
  }

  @Override
  public void initialize() {
    super.initialize();
    if (withEventEmitter) {
      this.eventEmitter.attachReactContext(getContext());
    }
  }

  public ReactContext getContext() {
    return getReactApplicationContext();
  }

  public Context getApplicationContext() {
    return getReactApplicationContext().getApplicationContext();
  }

  public Activity getActivity() {
    return getCurrentActivity();
  }

  @Override
  public String getName() {
    return "RNFB" + moduleName;
  }

  @Override
  public Map<String, Object> getConstants() {
    return new HashMap<>();
  }
}
