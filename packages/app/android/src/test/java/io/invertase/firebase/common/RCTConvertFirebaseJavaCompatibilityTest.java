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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import android.content.Context;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.FirebaseApp;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.Test;

/** Compile-time and reflection checks for callers that consume the Kotlin port from Java. */
public class RCTConvertFirebaseJavaCompatibilityTest {
  @Test
  public void preservesPublicOpenNoArgClassAndExactStaticMethodTypes() throws Exception {
    Class<RCTConvertFirebase> type = RCTConvertFirebase.class;

    assertTrue(Modifier.isPublic(type.getModifiers()));
    assertFalse(Modifier.isFinal(type.getModifiers()));
    assertTrue(Modifier.isPublic(type.getConstructor().getModifiers()));
    assertEquals(type, new RCTConvertFirebase().getClass());

    assertStaticMethod(
        type.getMethod("firebaseAppToMap", FirebaseApp.class),
        Map.class,
        String.class,
        Object.class);
    assertStaticMethod(
        type.getMethod("firebaseAppToWritableMap", FirebaseApp.class), WritableMap.class);
    assertStaticMethod(
        type.getMethod(
            "readableMapToFirebaseApp", ReadableMap.class, ReadableMap.class, Context.class),
        FirebaseApp.class);
    assertStaticMethod(
        type.getMethod("mapPutValue", String.class, Object.class, WritableMap.class),
        WritableMap.class);
    assertStaticMethod(
        type.getMethod("readableMapToWritableMap", ReadableMap.class), WritableMap.class);
    assertStaticMethod(
        type.getMethod("toHashMap", ReadableMap.class), Map.class, String.class, Object.class);
    assertStaticMethod(
        type.getMethod("toArrayList", ReadableArray.class), List.class, Object.class);
  }

  @Test
  public void staticCallAcceptsNullableValueWithoutKotlinEntryChecks() {
    WritableMap map = mock(WritableMap.class);

    assertSame(map, RCTConvertFirebase.mapPutValue("null", null, map));

    verify(map).putNull("null");
  }

  @Test
  public void javaStaticCollectionDelegatesPreserveMutableReturnIdentity() {
    ReadableMap readableMap = mock(ReadableMap.class);
    HashMap<String, Object> hashMap = new HashMap<>();
    when(readableMap.toHashMap()).thenReturn(hashMap);
    ReadableArray readableArray = mock(ReadableArray.class);
    ArrayList<Object> arrayList = new ArrayList<>();
    when(readableArray.toArrayList()).thenReturn(arrayList);

    assertSame(hashMap, RCTConvertFirebase.toHashMap(readableMap));
    assertSame(arrayList, RCTConvertFirebase.toArrayList(readableArray));
  }

  private static void assertStaticMethod(
      Method method, Class<?> returnType, Type... genericArguments) {
    assertTrue(Modifier.isPublic(method.getModifiers()));
    assertTrue(Modifier.isStatic(method.getModifiers()));
    assertEquals(returnType, method.getReturnType());

    if (genericArguments.length == 0) {
      assertEquals(returnType, method.getGenericReturnType());
      return;
    }

    ParameterizedType genericReturnType = (ParameterizedType) method.getGenericReturnType();
    assertEquals(returnType, genericReturnType.getRawType());
    assertEquals(List.of(genericArguments), List.of(genericReturnType.getActualTypeArguments()));
  }
}
