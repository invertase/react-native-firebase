package io.invertase.firebase.commoncompat

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

import com.facebook.react.bridge.ReactApplicationContext
import io.invertase.firebase.common.ReactNativeFirebaseModule
import org.junit.Assert.assertFalse
import org.junit.Test
import java.lang.reflect.Modifier

/** Compile-time contract for a Kotlin subclass outside the production package. */
class ReactNativeFirebaseModuleKotlinCompatibilityTest {
  @Test
  fun externalKotlinSubclassCanOverrideJavaVirtualSurface() {
    assertFalse(Modifier.isFinal(ExternalKotlinModule::class.java.modifiers))
  }

  private open class ExternalKotlinModule(
    reactContext: ReactApplicationContext?,
  ) : ReactNativeFirebaseModule(reactContext, null) {
    override fun initialize() {
      super.initialize()
    }

    override fun invalidate() {
      super.invalidate()
    }

    @Suppress("DEPRECATION")
    override fun onCatalystInstanceDestroy() {
      super.onCatalystInstanceDestroy()
    }

    override fun getName(): String = "ExternalKotlinModule"

    override fun getConstants(): MutableMap<String, Any> = super.getConstants()
  }
}
