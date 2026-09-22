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
 */

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import android.content.Context;
import android.content.res.Resources;
import android.graphics.Point;
import android.graphics.Rect;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import javax.annotation.Nullable;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockedStatic;
import org.robolectric.RobolectricTestRunner;

@RunWith(RobolectricTestRunner.class)
public class SharedUtilsJavaCompatibilityTest {
  @Test
  public void classAndPublicOuterMethodsPreserveJavaShape() throws Exception {
    assertTrue(Modifier.isPublic(new SharedUtils().getClass().getConstructor().getModifiers()));
    assertFalse(Modifier.isFinal(SharedUtils.class.getModifiers()));

    for (Method method : SharedUtils.class.getDeclaredMethods()) {
      if (Modifier.isPublic(method.getModifiers())) {
        assertTrue(method + " must remain static", Modifier.isStatic(method.getModifiers()));
      }
    }

    assertEquals(int[].class, method("rectToIntArray", Rect.class).getReturnType());
    assertEquals(int[].class, method("pointToIntArray", Point.class).getReturnType());
    assertEquals(
        "java.util.List<int[]>",
        method("pointsToIntsList", Point[].class).getGenericReturnType().getTypeName());
    assertEquals(
        Boolean.class, method("hasPackageClass", String.class, String.class).getReturnType());
    assertEquals(Boolean.class, method("reactNativeHasDevSupport").getReturnType());
    assertEquals(Boolean.class, method("isExpo").getReturnType());
    assertEquals(Boolean.class, method("isFlutter").getReturnType());
    assertEquals(Boolean.class, method("isReactNative").getReturnType());
    assertEquals(
        "java.util.Map<java.lang.String, java.lang.Object>",
        method("mapToWritableMap", Map.class).getGenericParameterTypes()[0].getTypeName());
    assertEquals(
        "java.util.List<int[]>",
        method("pointsToIntsList", Point[].class).getGenericReturnType().getTypeName());
  }

  @Test
  public void nullableParametersRetainJavaxNullableVisibility() throws Exception {
    assertParameterNullable(method("rectToIntArray", Rect.class), 0);
    assertParameterNullable(method("pointToIntArray", Point.class), 0);
    assertParameterNullable(method("pointsToIntsList", Point[].class), 0);
    assertParameterNullable(method("arrayPushValue", Object.class, WritableArray.class), 0);
    assertParameterNullable(
        method("mapPutValue", String.class, Object.class, WritableMap.class), 1);
  }

  @Test
  public void checkedJsonExceptionsAndOuterStaticWrappersRemainCallable() throws Exception {
    assertArrayEquals(new int[0], SharedUtils.pointToIntArray(null));
    assertTrue(SharedUtils.hasPackageClass("java.lang", "String"));
    assertFalse(SharedUtils.hasPackageClass("missing.package", "Missing"));

    assertArrayEquals(
        new Class<?>[] {JSONException.class},
        method("jsonObjectToWritableMap", JSONObject.class).getExceptionTypes());
    assertArrayEquals(
        new Class<?>[] {JSONException.class},
        method("jsonArrayToWritableArray", JSONArray.class).getExceptionTypes());
    assertEquals(List.class, method("pointsToIntsList", Point[].class).getReturnType());
  }

  @Test
  public void reactNativeDetectionPreservesClasspathShortCircuitBranches() throws Exception {
    assertTrue(SharedUtils.isExpo());
    assertFalse(SharedUtils.isReactNative());

    IsolatedSharedUtilsLoader reactNativeOnly = new IsolatedSharedUtilsLoader(false, true);
    assertFalse(invokeDetector(reactNativeOnly, "isExpo"));
    assertTrue(invokeDetector(reactNativeOnly, "isReactNative"));

    IsolatedSharedUtilsLoader neitherPlatform = new IsolatedSharedUtilsLoader(false, false);
    assertFalse(invokeDetector(neitherPlatform, "isExpo"));
    assertFalse(invokeDetector(neitherPlatform, "isReactNative"));

    IsolatedSharedUtilsLoader expoAndReactNative = new IsolatedSharedUtilsLoader(true, true);
    assertTrue(invokeDetector(expoAndReactNative, "isExpo"));
    assertFalse(invokeDetector(expoAndReactNative, "isReactNative"));
  }

  @Test
  public void everyOuterStaticWrapperExecutesFromJava() throws Exception {
    assertArrayEquals(new int[0], SharedUtils.rectToIntArray(null));
    assertArrayEquals(new int[0], SharedUtils.pointToIntArray(null));
    assertTrue(SharedUtils.pointsToIntsList(null).isEmpty());
    assertEquals("https", SharedUtils.getUri("https://example.test").getScheme());
    assertEquals("1970-01-01T00:00:00Z", SharedUtils.timestampToUTC(0));
    SharedUtils.sendEvent(null, "event", null);
    ReactContext reactContext = mock(ReactContext.class);
    DeviceEventManagerModule.RCTDeviceEventEmitter emitter =
        mock(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
    when(reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class))
        .thenReturn(emitter);
    SharedUtils.sendEvent(reactContext, null, null);
    verify(emitter).emit(null, null);

    Context noManager = mock(Context.class);
    when(noManager.getSystemService(Context.ACTIVITY_SERVICE)).thenReturn(null);
    assertFalse(SharedUtils.isAppInForeground(noManager));

    Context resourceContext = mock(Context.class);
    Resources resources = mock(Resources.class);
    when(resourceContext.getResources()).thenReturn(resources);
    when(resourceContext.getPackageName()).thenReturn("app.package");
    when(resources.getIdentifier("name", "string", "app.package")).thenReturn(7);
    assertEquals(7, SharedUtils.getResId(resourceContext, "name"));

    assertFalse(SharedUtils.reactNativeHasDevSupport());
    assertTrue(SharedUtils.isExpo());
    assertFalse(SharedUtils.isFlutter());
    assertFalse(SharedUtils.isReactNative());
    SharedUtils.hasPackageClass("java.lang", "String");

    WritableMap writableMap = mock(WritableMap.class);
    WritableArray writableArray = mock(WritableArray.class);
    ReadableMap readableMap = mock(ReadableMap.class);
    JSONObject jsonObject = mock(JSONObject.class);
    JSONArray jsonArray = mock(JSONArray.class);
    when(jsonObject.keys()).thenReturn(Collections.emptyIterator());
    when(jsonArray.length()).thenReturn(0);
    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      when(Arguments.createMap()).thenReturn(writableMap);
      when(Arguments.createArray()).thenReturn(writableArray);

      assertEquals(writableMap, SharedUtils.getExceptionMap(new Exception("failure")));
      assertEquals(writableMap, SharedUtils.jsonObjectToWritableMap(jsonObject));
      assertEquals(writableArray, SharedUtils.jsonArrayToWritableArray(jsonArray));
      assertEquals(writableMap, SharedUtils.mapToWritableMap(Collections.emptyMap()));
      SharedUtils.arrayPushValue(null, writableArray);
      SharedUtils.mapPutValue(null, null, writableMap);
      assertEquals(writableMap, SharedUtils.readableMapToWritableMap(readableMap));
    }
  }

  private static Method method(String name, Class<?>... parameterTypes) throws Exception {
    return SharedUtils.class.getMethod(name, parameterTypes);
  }

  private static void assertParameterNullable(Method method, int parameterIndex) {
    for (Annotation annotation : method.getParameterAnnotations()[parameterIndex]) {
      if (annotation.annotationType() == Nullable.class) {
        return;
      }
    }
    throw new AssertionError(
        method + " parameter " + parameterIndex + " lost javax.annotation.Nullable");
  }

  private static boolean invokeDetector(ClassLoader loader, String methodName) throws Exception {
    return (Boolean)
        loader
            .loadClass("io.invertase.firebase.common.SharedUtils")
            .getMethod(methodName)
            .invoke(null);
  }

  private static final class IsolatedSharedUtilsLoader extends ClassLoader {
    private final boolean exposeExpo;
    private final boolean exposeReactNative;

    IsolatedSharedUtilsLoader(boolean exposeExpo, boolean exposeReactNative) {
      super(SharedUtils.class.getClassLoader());
      this.exposeExpo = exposeExpo;
      this.exposeReactNative = exposeReactNative;
    }

    @Override
    protected synchronized Class<?> loadClass(String name, boolean resolve)
        throws ClassNotFoundException {
      if (name.equals("expo.core.ModuleRegistry") && !exposeExpo) {
        throw new ClassNotFoundException(name);
      }
      if (name.equals("com.facebook.react.bridge.NativeModuleRegistry") && !exposeReactNative) {
        throw new ClassNotFoundException(name);
      }
      if (name.equals("io.invertase.firebase.common.SharedUtils")
          || name.equals("io.invertase.firebase.common.SharedUtils$Companion")) {
        Class<?> loaded = findLoadedClass(name);
        if (loaded == null) {
          loaded = defineSharedUtilsClass(name);
        }
        if (resolve) {
          resolveClass(loaded);
        }
        return loaded;
      }
      return super.loadClass(name, resolve);
    }

    private Class<?> defineSharedUtilsClass(String name) throws ClassNotFoundException {
      String resource = name.replace('.', '/') + ".class";
      try (InputStream input = getParent().getResourceAsStream(resource)) {
        if (input == null) {
          throw new ClassNotFoundException(name);
        }
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        input.transferTo(output);
        byte[] bytes = output.toByteArray();
        return defineClass(name, bytes, 0, bytes.length);
      } catch (IOException exception) {
        throw new ClassNotFoundException(name, exception);
      }
    }
  }
}
