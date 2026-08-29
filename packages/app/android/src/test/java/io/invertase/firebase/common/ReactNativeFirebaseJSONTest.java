package io.invertase.firebase.common;

/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import static org.junit.Assert.assertSame;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import java.lang.reflect.Field;
import java.util.Collections;
import java.util.List;
import org.json.JSONObject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.mockito.MockedStatic;

/**
 * Plain JUnit4 + Mockito (AndroidTest-AD-1). Covers {@link ReactNativeFirebaseJSON#getAll()}.
 * JSONObject is mocked because Android's org.json stubs are not available on the JVM.
 */
public class ReactNativeFirebaseJSONTest {

  private ReactNativeFirebaseJSON json;
  private Field jsonObjectField;
  private Object originalJsonObject;

  @Before
  public void setUp() throws Exception {
    json = ReactNativeFirebaseJSON.getSharedInstance();
    jsonObjectField = ReactNativeFirebaseJSON.class.getDeclaredField("jsonObject");
    jsonObjectField.setAccessible(true);
    originalJsonObject = jsonObjectField.get(json);
  }

  @After
  public void tearDown() throws Exception {
    jsonObjectField.set(json, originalJsonObject);
  }

  @Test
  public void getAllReturnsEmptyMapWhenJsonObjectIsNull() throws Exception {
    WritableMap emptyMap = mock(WritableMap.class);
    jsonObjectField.set(json, null);

    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      arguments.when(Arguments::createMap).thenReturn(emptyMap);

      assertSame(emptyMap, json.getAll());
      verifyNoInteractions(emptyMap);
    }
  }

  @Test
  public void getAllReturnsEmptyMapForEmptyJsonObject() throws Exception {
    WritableMap emptyMap = mock(WritableMap.class);
    JSONObject jsonObject = mock(JSONObject.class);
    when(jsonObject.keys()).thenReturn(Collections.emptyIterator());
    jsonObjectField.set(json, jsonObject);

    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      arguments.when(Arguments::createMap).thenReturn(emptyMap);

      assertSame(emptyMap, json.getAll());
      verifyNoInteractions(emptyMap);
    }
  }

  @Test
  public void getAllMapsNonEmptyJsonObjectEntries() throws Exception {
    WritableMap writableMap = mock(WritableMap.class);
    JSONObject jsonObject = mock(JSONObject.class);
    when(jsonObject.keys()).thenReturn(List.of("analytics_auto_collection_enabled").iterator());
    when(jsonObject.get("analytics_auto_collection_enabled")).thenReturn(false);
    jsonObjectField.set(json, jsonObject);

    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class);
        MockedStatic<SharedUtils> sharedUtils = mockStatic(SharedUtils.class)) {
      arguments.when(Arguments::createMap).thenReturn(writableMap);

      assertSame(writableMap, json.getAll());

      sharedUtils.verify(
          () ->
              SharedUtils.mapPutValue(
                  eq("analytics_auto_collection_enabled"), eq(false), eq(writableMap)));
    }
  }
}
