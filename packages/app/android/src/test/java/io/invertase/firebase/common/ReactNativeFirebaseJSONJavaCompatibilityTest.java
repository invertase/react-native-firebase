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
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import org.json.JSONObject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

/** Proves the Kotlin port preserves calls that Java permits with null reference arguments. */
public class ReactNativeFirebaseJSONJavaCompatibilityTest {
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
  public void publicAccessorsAcceptNullKeysFromJava() throws Exception {
    JSONObject jsonObject = mock(JSONObject.class);
    when(jsonObject.has(null)).thenReturn(true);
    when(jsonObject.optBoolean(null, true)).thenReturn(false);
    when(jsonObject.optInt(null, 17)).thenReturn(23);
    when(jsonObject.optLong(null, 29L)).thenReturn(31L);
    when(jsonObject.optString(null, "fallback")).thenReturn("value");
    when(jsonObject.optJSONArray(null)).thenReturn(null);
    jsonObjectField.set(json, jsonObject);

    assertTrue(json.contains(null));
    assertFalse(json.getBooleanValue(null, true));
    assertEquals(23, json.getIntValue(null, 17));
    assertEquals(31L, json.getLongValue(null, 29L));
    assertEquals("value", json.getStringValue(null, "fallback"));

    ArrayList<String> result = json.getArrayValue(null);
    result.add("mutable");
    assertEquals(List.of("mutable"), result);
  }

  @Test
  public void getStringValueAcceptsAndReturnsNullDefaultFromJava() throws Exception {
    jsonObjectField.set(json, null);
    assertNull(json.getStringValue(null, null));

    JSONObject jsonObject = mock(JSONObject.class);
    when(jsonObject.optString(null, null)).thenReturn(null);
    jsonObjectField.set(json, jsonObject);
    assertNull(json.getStringValue(null, null));
  }
}
