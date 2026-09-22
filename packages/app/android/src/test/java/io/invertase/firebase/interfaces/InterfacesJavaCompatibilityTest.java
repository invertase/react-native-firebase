package io.invertase.firebase.interfaces;

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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import android.app.Activity;
import android.content.Context;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.junit.Test;

public class InterfacesJavaCompatibilityTest {
  @Test
  public void contextProvider_preservesExactAbstractGetterApi() {
    Map<String, Method> methods = declaredMethods(ContextProvider.class);

    assertEquals(
        Arrays.asList("getActivity", "getApplicationContext", "getContext"),
        methods.keySet().stream().sorted().collect(Collectors.toList()));
    assertGetter(methods.get("getActivity"), Activity.class);
    assertGetter(methods.get("getContext"), ReactContext.class);
    assertGetter(methods.get("getApplicationContext"), Context.class);
  }

  @Test
  public void nativeError_preservesExactAbstractGetterApi() {
    Map<String, Method> methods = declaredMethods(NativeError.class);

    assertEquals(
        Arrays.asList(
            "getErrorCode",
            "getErrorMessage",
            "getFirebaseAppName",
            "getFirebaseServiceName",
            "getUserInfo"),
        methods.keySet().stream().sorted().collect(Collectors.toList()));
    assertGetter(methods.get("getErrorCode"), String.class);
    assertGetter(methods.get("getErrorMessage"), String.class);
    assertGetter(methods.get("getFirebaseAppName"), String.class);
    assertGetter(methods.get("getFirebaseServiceName"), String.class);
    assertGetter(methods.get("getUserInfo"), WritableMap.class);
  }

  @Test
  public void javaCanImplementAndCallContextProviderWithNulls() {
    ContextProvider provider =
        new ContextProvider() {
          @Override
          public Activity getActivity() {
            return null;
          }

          @Override
          public ReactContext getContext() {
            return null;
          }

          @Override
          public Context getApplicationContext() {
            return null;
          }
        };

    assertNull(provider.getActivity());
    assertNull(provider.getContext());
    assertNull(provider.getApplicationContext());
  }

  @Test
  public void javaCanImplementAndCallNativeErrorWithNulls() {
    NativeError error =
        new NativeError() {
          @Override
          public String getErrorCode() {
            return null;
          }

          @Override
          public String getErrorMessage() {
            return null;
          }

          @Override
          public String getFirebaseAppName() {
            return null;
          }

          @Override
          public String getFirebaseServiceName() {
            return null;
          }

          @Override
          public WritableMap getUserInfo() {
            return null;
          }
        };

    assertNull(error.getErrorCode());
    assertNull(error.getErrorMessage());
    assertNull(error.getFirebaseAppName());
    assertNull(error.getFirebaseServiceName());
    assertNull(error.getUserInfo());
  }

  private static Map<String, Method> declaredMethods(Class<?> interfaceClass) {
    assertTrue(interfaceClass.isInterface());
    assertTrue(Modifier.isPublic(interfaceClass.getModifiers()));
    assertTrue(Modifier.isAbstract(interfaceClass.getModifiers()));
    return Arrays.stream(interfaceClass.getDeclaredMethods())
        .collect(Collectors.toMap(Method::getName, Function.identity()));
  }

  private static void assertGetter(Method method, Class<?> returnType) {
    assertEquals(returnType, method.getReturnType());
    assertEquals(0, method.getParameterCount());
    assertTrue(Modifier.isPublic(method.getModifiers()));
    assertTrue(Modifier.isAbstract(method.getModifiers()));
  }
}
