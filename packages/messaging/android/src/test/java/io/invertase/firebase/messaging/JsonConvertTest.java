package io.invertase.firebase.messaging;

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
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.Arrays;
import java.util.Iterator;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockedStatic;
import org.robolectric.RobolectricTestRunner;

/**
 * JVM coverage for {@link JsonConvert}. Does not load the React Native bridge — {@link
 * Arguments#createMap()} / {@link Arguments#createArray()} are stubbed via mockito-mockstatic
 * (SoLoader-safe). Robolectric supplies real {@code org.json} (android.jar stubs throw otherwise);
 * AndroidTest-AD-1.
 */
@RunWith(RobolectricTestRunner.class)
public class JsonConvertTest {

  @Test
  public void javaStaticShapePreservedForStoreImplImports() throws Exception {
    assertTrue(Modifier.isPublic(JsonConvert.class.getModifiers()));
    assertTrue(Modifier.isFinal(JsonConvert.class.getModifiers()));
    // Kotlin object INSTANCE is initialized when static helpers are first used.
    assertSame(JsonConvert.INSTANCE, JsonConvert.INSTANCE);

    Method reactMap = JsonConvert.class.getMethod("reactToJSON", ReadableMap.class);
    Method reactArray = JsonConvert.class.getMethod("reactToJSON", ReadableArray.class);
    Method jsonMap = JsonConvert.class.getMethod("jsonToReact", JSONObject.class);
    Method jsonArray = JsonConvert.class.getMethod("jsonToReact", JSONArray.class);

    for (Method method : Arrays.asList(reactMap, reactArray, jsonMap, jsonArray)) {
      assertTrue(method.getName(), Modifier.isStatic(method.getModifiers()));
      assertTrue(method.getName(), Modifier.isPublic(method.getModifiers()));
      assertEquals(JSONException.class, method.getExceptionTypes()[0]);
    }
  }

  @Test
  public void reactToJSON_map_coversAllReadableTypesIncludingNested() throws Exception {
    ReadableMap nestedMap = mock(ReadableMap.class);
    ReadableMapKeySetIterator nestedIterator = mock(ReadableMapKeySetIterator.class);
    when(nestedMap.keySetIterator()).thenReturn(nestedIterator);
    when(nestedIterator.hasNextKey()).thenReturn(true, false);
    when(nestedIterator.nextKey()).thenReturn("inner");
    when(nestedMap.getType("inner")).thenReturn(ReadableType.String);
    when(nestedMap.getString("inner")).thenReturn("nested-string");

    ReadableArray nestedArray = mock(ReadableArray.class);
    when(nestedArray.size()).thenReturn(1);
    when(nestedArray.getType(0)).thenReturn(ReadableType.Boolean);
    when(nestedArray.getBoolean(0)).thenReturn(true);

    ReadableMap map = mock(ReadableMap.class);
    ReadableMapKeySetIterator iterator = mock(ReadableMapKeySetIterator.class);
    when(map.keySetIterator()).thenReturn(iterator);
    when(iterator.hasNextKey()).thenReturn(true, true, true, true, true, true, false);
    when(iterator.nextKey())
        .thenReturn("n", "b", "num", "s", "m", "a");
    when(map.getType("n")).thenReturn(ReadableType.Null);
    when(map.getType("b")).thenReturn(ReadableType.Boolean);
    when(map.getType("num")).thenReturn(ReadableType.Number);
    when(map.getType("s")).thenReturn(ReadableType.String);
    when(map.getType("m")).thenReturn(ReadableType.Map);
    when(map.getType("a")).thenReturn(ReadableType.Array);
    when(map.getBoolean("b")).thenReturn(false);
    when(map.getDouble("num")).thenReturn(3.5);
    when(map.getString("s")).thenReturn("hello");
    when(map.getMap("m")).thenReturn(nestedMap);
    when(map.getArray("a")).thenReturn(nestedArray);

    JSONObject json = JsonConvert.reactToJSON(map);

    assertSame(JSONObject.NULL, json.get("n"));
    assertEquals(false, json.getBoolean("b"));
    assertEquals(3.5, json.getDouble("num"), 0.0);
    assertEquals("hello", json.getString("s"));
    assertEquals("nested-string", json.getJSONObject("m").getString("inner"));
    assertEquals(true, json.getJSONArray("a").getBoolean(0));
  }

  @Test
  public void reactToJSON_array_coversAllReadableTypesIncludingNested() throws Exception {
    ReadableMap nestedMap = mock(ReadableMap.class);
    ReadableMapKeySetIterator nestedIterator = mock(ReadableMapKeySetIterator.class);
    when(nestedMap.keySetIterator()).thenReturn(nestedIterator);
    when(nestedIterator.hasNextKey()).thenReturn(true, false);
    when(nestedIterator.nextKey()).thenReturn("k");
    when(nestedMap.getType("k")).thenReturn(ReadableType.Number);
    when(nestedMap.getDouble("k")).thenReturn(9.0);

    ReadableArray nestedArray = mock(ReadableArray.class);
    when(nestedArray.size()).thenReturn(1);
    when(nestedArray.getType(0)).thenReturn(ReadableType.String);
    when(nestedArray.getString(0)).thenReturn("deep");

    ReadableArray array = mock(ReadableArray.class);
    when(array.size()).thenReturn(6);
    when(array.getType(0)).thenReturn(ReadableType.Null);
    when(array.getType(1)).thenReturn(ReadableType.Boolean);
    when(array.getType(2)).thenReturn(ReadableType.Number);
    when(array.getType(3)).thenReturn(ReadableType.String);
    when(array.getType(4)).thenReturn(ReadableType.Map);
    when(array.getType(5)).thenReturn(ReadableType.Array);
    when(array.getBoolean(1)).thenReturn(true);
    when(array.getDouble(2)).thenReturn(1.25);
    when(array.getString(3)).thenReturn("arr");
    when(array.getMap(4)).thenReturn(nestedMap);
    when(array.getArray(5)).thenReturn(nestedArray);

    JSONArray json = JsonConvert.reactToJSON(array);

    assertSame(JSONObject.NULL, json.get(0));
    assertEquals(true, json.getBoolean(1));
    assertEquals(1.25, json.getDouble(2), 0.0);
    assertEquals("arr", json.getString(3));
    assertEquals(9.0, json.getJSONObject(4).getDouble("k"), 0.0);
    assertEquals("deep", json.getJSONArray(5).getString(0));
  }

  @Test
  public void jsonToReact_object_coversAllInstanceofBranchesIncludingNullAndNested()
      throws Exception {
    WritableMap writableMap = mock(WritableMap.class);
    WritableMap nestedWritableMap = mock(WritableMap.class);
    WritableArray nestedWritableArray = mock(WritableArray.class);

    JSONObject nestedObject = new JSONObject();
    nestedObject.put("inner", "x");
    JSONArray nestedArray = new JSONArray();
    nestedArray.put(7);

    JSONObject json = new JSONObject();
    json.put("b", true);
    json.put("num", 42);
    json.put("s", "str");
    json.put("m", nestedObject);
    json.put("a", nestedArray);
    json.put("n", JSONObject.NULL);

    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      when(Arguments.createMap()).thenReturn(writableMap, nestedWritableMap);
      when(Arguments.createArray()).thenReturn(nestedWritableArray);

      WritableMap result = JsonConvert.jsonToReact(json);

      assertSame(writableMap, result);
      verify(writableMap).putBoolean("b", true);
      verify(writableMap).putDouble("num", 42.0);
      verify(writableMap).putString("s", "str");
      verify(writableMap).putMap("m", nestedWritableMap);
      verify(writableMap).putArray("a", nestedWritableArray);
      verify(writableMap).putNull("n");
      verify(nestedWritableMap).putString("inner", "x");
      verify(nestedWritableArray).pushDouble(7.0);
    }
  }

  @Test
  public void jsonToReact_array_coversAllInstanceofBranchesIncludingNullAndNested()
      throws Exception {
    WritableArray writableArray = mock(WritableArray.class);
    WritableMap nestedWritableMap = mock(WritableMap.class);
    WritableArray nestedWritableArray = mock(WritableArray.class);

    JSONObject nestedObject = new JSONObject();
    nestedObject.put("k", false);
    JSONArray nestedArray = new JSONArray();
    nestedArray.put("deep");

    JSONArray json = new JSONArray();
    json.put(false);
    json.put(2.5);
    json.put("s");
    json.put(nestedObject);
    json.put(nestedArray);
    json.put(JSONObject.NULL);

    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      when(Arguments.createArray()).thenReturn(writableArray, nestedWritableArray);
      when(Arguments.createMap()).thenReturn(nestedWritableMap);

      WritableArray result = JsonConvert.jsonToReact(json);

      assertSame(writableArray, result);
      verify(writableArray).pushBoolean(false);
      verify(writableArray).pushDouble(2.5);
      verify(writableArray).pushString("s");
      verify(writableArray).pushMap(nestedWritableMap);
      verify(writableArray).pushArray(nestedWritableArray);
      verify(writableArray).pushNull();
      verify(nestedWritableMap).putBoolean("k", false);
      verify(nestedWritableArray).pushString("deep");
    }
  }

  @Test
  public void reactToJSON_emptyMapAndArray_returnEmptyJson() throws Exception {
    ReadableMap map = mock(ReadableMap.class);
    ReadableMapKeySetIterator iterator = mock(ReadableMapKeySetIterator.class);
    when(map.keySetIterator()).thenReturn(iterator);
    when(iterator.hasNextKey()).thenReturn(false);

    ReadableArray array = mock(ReadableArray.class);
    when(array.size()).thenReturn(0);

    assertEquals(0, JsonConvert.reactToJSON(map).length());
    assertEquals(0, JsonConvert.reactToJSON(array).length());
  }

  @Test
  public void jsonToReact_emptyObjectAndArray_returnStubbedWritables() throws Exception {
    WritableMap writableMap = mock(WritableMap.class);
    WritableArray writableArray = mock(WritableArray.class);

    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      when(Arguments.createMap()).thenReturn(writableMap);
      when(Arguments.createArray()).thenReturn(writableArray);

      assertSame(writableMap, JsonConvert.jsonToReact(new JSONObject()));
      assertSame(writableArray, JsonConvert.jsonToReact(new JSONArray()));
    }
  }

  @Test
  public void jsonToReact_skipsUnknownValueTypes() throws Exception {
    WritableMap writableMap = mock(WritableMap.class);
    WritableArray writableArray = mock(WritableArray.class);

    // org.json allows putting arbitrary objects; JsonConvert has no else branch for them.
    JSONObject object = new JSONObject();
    object.put("ignored", new Object() {});
    JSONArray array = new JSONArray();
    array.put(new Object() {});

    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      when(Arguments.createMap()).thenReturn(writableMap);
      when(Arguments.createArray()).thenReturn(writableArray);

      JsonConvert.jsonToReact(object);
      JsonConvert.jsonToReact(array);
    }
  }

  @Test
  public void jsonObjectKeysIteratorIsConsumed() throws Exception {
    // Guards against accidental use of keys() without advancing (infinite loop risk).
    JSONObject json = new JSONObject();
    json.put("only", "once");
    Iterator<String> keys = json.keys();
    assertTrue(keys.hasNext());

    WritableMap writableMap = mock(WritableMap.class);
    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      when(Arguments.createMap()).thenReturn(writableMap);
      JsonConvert.jsonToReact(json);
      verify(writableMap).putString("only", "once");
    }
  }
}
