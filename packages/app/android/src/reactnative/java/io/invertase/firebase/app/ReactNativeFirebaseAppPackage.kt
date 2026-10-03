package io.invertase.firebase.app

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
 */

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import io.invertase.firebase.utils.NativeRNFBTurboUtils
import java.util.ArrayList
import java.util.Collections
import javax.annotation.Nonnull

@Suppress("unused")
open class ReactNativeFirebaseAppPackage : ReactPackage {
  @Nonnull
  override fun createNativeModules(
    @Nonnull reactContext: ReactApplicationContext,
  ): MutableList<NativeModule> {
    if (ReactNativeFirebaseApp.getApplicationContext() == null) {
      ReactNativeFirebaseApp.setApplicationContext(reactContext.applicationContext)
    }
    return ArrayList<NativeModule>().apply {
      add(NativeRNFBTurboApp(reactContext))
      add(NativeRNFBTurboUtils(reactContext))
    }
  }

  @Nonnull
  override fun createViewManagers(
    @Nonnull reactContext: ReactApplicationContext,
  ): MutableList<ViewManager<out Nothing, out Nothing>> = Collections.emptyList()
}
