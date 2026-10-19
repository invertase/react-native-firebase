package io.invertase.firebase.commoncompat;

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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import io.invertase.firebase.common.ReactNativeFirebaseModule;
import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import org.junit.Test;
import org.mockito.MockedStatic;

/** Compile-time and reflection contract for external Java subclasses and callers. */
public class ReactNativeFirebaseModuleJavaCompatibilityTest {
  @Test
  public void outerClassPreservesConstructorsMethodsAndModifiers() throws Exception {
    assertTrue(Modifier.isPublic(ReactNativeFirebaseModule.class.getModifiers()));
    assertFalse(Modifier.isFinal(ReactNativeFirebaseModule.class.getModifiers()));

    Constructor<ReactNativeFirebaseModule> constructor =
        ReactNativeFirebaseModule.class.getConstructor(ReactApplicationContext.class, String.class);
    assertTrue(Modifier.isPublic(constructor.getModifiers()));

    assertOpen("initialize");
    assertOpen("invalidate");
    assertOpen("onCatalystInstanceDestroy");
    assertOpen("getName");
    assertOpen("getConstants");
    assertFinal("getExecutor");
    assertFinal("getTransactionalExecutor");
    assertFinal("getTransactionalExecutor", String.class);
    assertFinal("removeEventListeningExecutor", String.class);

    assertTrue(
        ReactNativeFirebaseModule.class
            .getMethod("onCatalystInstanceDestroy")
            .isAnnotationPresent(Deprecated.class));

    Method constants = ReactNativeFirebaseModule.class.getMethod("getConstants");
    assertEquals(Map.class, constants.getReturnType());
    ParameterizedType genericReturn = (ParameterizedType) constants.getGenericReturnType();
    assertEquals(String.class, genericReturn.getActualTypeArguments()[0]);
    assertEquals(Object.class, genericReturn.getActualTypeArguments()[1]);
  }

  @Test
  public void staticHelperDescriptorsRemainJavaCallable() throws Exception {
    assertStatic("rejectPromiseWithExceptionMap", Promise.class, Exception.class);
    assertStatic("rejectPromiseWithCodeAndMessage", Promise.class, String.class, String.class);
    assertStatic(
        "rejectPromiseWithCodeAndMessage",
        Promise.class,
        String.class,
        String.class,
        ReadableMap.class);
    assertStatic(
        "rejectPromiseWithCodeAndMessage", Promise.class, String.class, String.class, String.class);
  }

  @Test
  public void staticOuterHelpersExecuteFromJava() {
    Promise promise = mock(Promise.class);
    WritableMap map = mock(WritableMap.class);
    ReadableMap resolver = mock(ReadableMap.class);
    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      when(Arguments.createMap()).thenReturn(map);

      ReactNativeFirebaseModule.rejectPromiseWithCodeAndMessage(
          promise, "resolver-code", "message", resolver);
      ReactNativeFirebaseModule.rejectPromiseWithCodeAndMessage(promise, "plain-code", "message");
      ReactNativeFirebaseModule.rejectPromiseWithCodeAndMessage(
          promise, "native-code", "message", "native");

      verify(promise).reject("resolver-code", "message", map);
      verify(promise).reject("plain-code", "message", map);
      verify(promise).reject("native-code", "message", map);
    }

    Exception exception = new Exception("failure");
    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      when(Arguments.createMap()).thenReturn(map);

      ReactNativeFirebaseModule.rejectPromiseWithExceptionMap(promise, exception);

      verify(promise).reject(exception, map);
      verify(map).putString("code", "unknown");
      verify(map).putString("nativeErrorCode", "unknown");
      verify(map).putString("message", "failure");
      verify(map).putString("nativeErrorMessage", "failure");
    }
  }

  @SuppressWarnings({"deprecation", "removal"})
  private static final class ExternalJavaModule extends ReactNativeFirebaseModule {
    ExternalJavaModule(ReactApplicationContext reactContext) {
      super(reactContext, null);
    }

    @Override
    public void initialize() {
      super.initialize();
    }

    @Override
    public void invalidate() {
      super.invalidate();
    }

    @Override
    public void onCatalystInstanceDestroy() {
      super.onCatalystInstanceDestroy();
    }

    @Override
    public String getName() {
      return "ExternalJavaModule";
    }

    @Override
    public Map<String, Object> getConstants() {
      return super.getConstants();
    }

    ExecutorService executor(String identifier) {
      return getTransactionalExecutor(identifier);
    }
  }

  private static void assertOpen(String name, Class<?>... parameterTypes) throws Exception {
    Method method = ReactNativeFirebaseModule.class.getMethod(name, parameterTypes);
    assertTrue(Modifier.isPublic(method.getModifiers()));
    assertFalse(Modifier.isFinal(method.getModifiers()));
  }

  private static void assertFinal(String name, Class<?>... parameterTypes) throws Exception {
    Method method = ReactNativeFirebaseModule.class.getMethod(name, parameterTypes);
    assertTrue(Modifier.isPublic(method.getModifiers()));
    assertTrue(Modifier.isFinal(method.getModifiers()));
  }

  private static void assertStatic(String name, Class<?>... parameterTypes) throws Exception {
    Method method = ReactNativeFirebaseModule.class.getMethod(name, parameterTypes);
    assertTrue(Modifier.isPublic(method.getModifiers()));
    assertTrue(Modifier.isStatic(method.getModifiers()));
    assertEquals(void.class, method.getReturnType());
  }
}
