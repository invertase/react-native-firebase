package io.invertase.firebase.app;

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

import static org.junit.Assert.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.times;

import android.util.Log;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.junit.After;
import org.junit.Test;
import org.mockito.MockedStatic;

/** Proves Java callers retain nullable calls and the public no-argument constructor. */
public class ReactNativeFirebaseAppJavaCompatibilityTest {
  @After
  public void resetApplicationContext() {
    try (MockedStatic<Log> ignored = mockStatic(Log.class)) {
      ReactNativeFirebaseApp.setApplicationContext(null);
    }
  }

  @Test
  public void javaCanConstructAndCallEveryStaticMethodWithNull() {
    new ReactNativeFirebaseApp();
    FirebaseOptions options = mock(FirebaseOptions.class);

    try (MockedStatic<Log> log = mockStatic(Log.class);
        MockedStatic<FirebaseOptions> firebaseOptions = mockStatic(FirebaseOptions.class);
        MockedStatic<FirebaseApp> firebaseApps = mockStatic(FirebaseApp.class)) {
      firebaseOptions.when(() -> FirebaseOptions.fromResource(null)).thenReturn(options);

      ReactNativeFirebaseApp.setApplicationContext(null);
      assertNull(ReactNativeFirebaseApp.getApplicationContext());
      ReactNativeFirebaseApp.initializeSecondaryApp(null);
      ReactNativeFirebaseApp.initializeSecondaryApp(null, null);

      log.verify(() -> Log.d("ReactNativeFirebaseApp", "received application context."), times(1));
      firebaseOptions.verify(() -> FirebaseOptions.fromResource(null), times(2));
      firebaseApps.verify(() -> FirebaseApp.initializeApp(null, options, null), times(2));
    }
  }
}
