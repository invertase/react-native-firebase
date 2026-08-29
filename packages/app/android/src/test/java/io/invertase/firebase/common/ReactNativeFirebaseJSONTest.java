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
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import java.lang.reflect.Field;
import org.json.JSONObject;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockedStatic;
import org.robolectric.RobolectricTestRunner;

@RunWith(RobolectricTestRunner.class)
public class ReactNativeFirebaseJSONTest {

  @Test
  public void getAllReturnsEmptyMapForEmptyJson() throws Exception {
    ReactNativeFirebaseJSON json = ReactNativeFirebaseJSON.getSharedInstance();
    Field jsonObjectField = ReactNativeFirebaseJSON.class.getDeclaredField("jsonObject");
    jsonObjectField.setAccessible(true);
    Object originalJsonObject = jsonObjectField.get(json);
    WritableMap emptyMap = mock(WritableMap.class);

    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      arguments.when(Arguments::createMap).thenReturn(emptyMap);
      jsonObjectField.set(json, new JSONObject());

      assertSame(emptyMap, json.getAll());
    } finally {
      jsonObjectField.set(json, originalJsonObject);
    }
  }
}
