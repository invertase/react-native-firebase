package io.invertase.firebase.crashlytics;

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

import static io.invertase.firebase.crashlytics.Constants.KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED;
import static io.invertase.firebase.crashlytics.Constants.KEY_CRASHLYTICS_DEBUG_ENABLED;
import static io.invertase.firebase.crashlytics.Constants.KEY_CRASHLYTICS_IS_ERROR_GENERATION_ON_JS_CRASH_ENABLED;
import static io.invertase.firebase.crashlytics.Constants.KEY_CRASHLYTICS_JAVASCRIPT_EXCEPTION_HANDLER_CHAINING_ENABLED;
import static io.invertase.firebase.crashlytics.Constants.KEY_CRASHLYTICS_NDK_ENABLED;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import org.junit.Test;

/**
 * JVM coverage for Kotlin-ported {@link Constants}, {@link JavaScriptError}, and {@link
 * UnhandledPromiseRejection}. Asserts preference-key string values, Java static-field shape for
 * InitProvider static imports, and cosmetic Crashlytics console type names.
 */
public class ConstantsAndJsErrorTypesTest {

  @Test
  public void constants_stringValuesMatchExpectedKeys() {
    assertEquals("crashlytics_ndk_enabled", KEY_CRASHLYTICS_NDK_ENABLED);
    assertEquals("crashlytics_debug_enabled", KEY_CRASHLYTICS_DEBUG_ENABLED);
    assertEquals("crashlytics_auto_collection_enabled", KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED);
    assertEquals(
        "crashlytics_is_error_generation_on_js_crash_enabled",
        KEY_CRASHLYTICS_IS_ERROR_GENERATION_ON_JS_CRASH_ENABLED);
    assertEquals(
        "crashlytics_javascript_exception_handler_chaining_enabled",
        KEY_CRASHLYTICS_JAVASCRIPT_EXCEPTION_HANDLER_CHAINING_ENABLED);
  }

  @Test
  public void constants_fieldsArePublicStaticForJavaStaticImport() throws Exception {
    String[] names = {
      "KEY_CRASHLYTICS_NDK_ENABLED",
      "KEY_CRASHLYTICS_DEBUG_ENABLED",
      "KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED",
      "KEY_CRASHLYTICS_IS_ERROR_GENERATION_ON_JS_CRASH_ENABLED",
      "KEY_CRASHLYTICS_JAVASCRIPT_EXCEPTION_HANDLER_CHAINING_ENABLED",
    };
    for (String name : names) {
      Field field = Constants.class.getField(name);
      int modifiers = field.getModifiers();
      assertTrue(name, Modifier.isPublic(modifiers));
      assertTrue(name, Modifier.isStatic(modifiers));
      assertTrue(name, Modifier.isFinal(modifiers));
      assertEquals(name, String.class, field.getType());
    }
  }

  @Test
  public void javaScriptError_constructsWithMessageAndCosmeticSimpleName() {
    JavaScriptError error = new JavaScriptError("js-boom");
    assertEquals("js-boom", error.getMessage());
    assertEquals("JavaScriptError", error.getClass().getSimpleName());
  }

  @Test
  public void unhandledPromiseRejection_constructsWithMessageAndCosmeticSimpleName() {
    UnhandledPromiseRejection error = new UnhandledPromiseRejection("promise-boom");
    assertEquals("promise-boom", error.getMessage());
    assertEquals("UnhandledPromiseRejection", error.getClass().getSimpleName());
  }
}
