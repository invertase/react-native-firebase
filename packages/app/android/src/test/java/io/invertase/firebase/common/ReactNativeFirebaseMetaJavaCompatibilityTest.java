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
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

import android.content.Context;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import io.invertase.firebase.app.ReactNativeFirebaseApp;
import org.junit.Test;
import org.mockito.MockedStatic;

/** Compiles and exercises the Kotlin implementation through its Java ABI, including null calls. */
public class ReactNativeFirebaseMetaJavaCompatibilityTest {
  @Test
  public void javaCallersCanConstructOverrideAndPassNull() {
    Context context = mock(Context.class);
    WritableMap writableMap = mock(WritableMap.class);
    when(context.getPackageManager()).thenReturn(null);

    try (MockedStatic<ReactNativeFirebaseApp> firebaseApp =
            mockStatic(ReactNativeFirebaseApp.class);
        MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      firebaseApp.when(ReactNativeFirebaseApp::getApplicationContext).thenReturn(context);
      arguments.when(Arguments::createMap).thenReturn(writableMap);

      ReactNativeFirebaseMeta meta =
          new ReactNativeFirebaseMeta() {
            @Override
            public boolean contains(String key) {
              return super.contains(key);
            }
          };

      assertFalse(meta.contains(null));
      assertFalse(meta.getBooleanValue(null, false));
      assertEquals(7, meta.getIntValue(null, 7));
      assertNull(meta.getStringValue(null, null));
      assertEquals(writableMap, meta.getAll());
    }
  }
}
