package io.invertase.firebase.crashlytics;

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

import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;

import com.google.firebase.crashlytics.FirebaseCrashlytics;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.Arrays;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockedStatic;
import org.robolectric.RobolectricTestRunner;

/**
 * JVM coverage for {@link ReactNativeFirebaseCrashlyticsNativeHelper}. Stubs {@link
 * FirebaseCrashlytics#getInstance()} via mockito-mockstatic so the helper can be exercised without
 * initializing the Firebase SDK. Robolectric supplies an Android runtime for Firebase class
 * loading; AndroidTest-AD-1.
 */
@RunWith(RobolectricTestRunner.class)
public class ReactNativeFirebaseCrashlyticsNativeHelperTest {

  @Test
  public void javaStaticShapePreservedForNativeCallers() throws Exception {
    assertTrue(Modifier.isPublic(ReactNativeFirebaseCrashlyticsNativeHelper.class.getModifiers()));
    assertTrue(Modifier.isFinal(ReactNativeFirebaseCrashlyticsNativeHelper.class.getModifiers()));
    assertSame(
        ReactNativeFirebaseCrashlyticsNativeHelper.INSTANCE,
        ReactNativeFirebaseCrashlyticsNativeHelper.INSTANCE);

    Method record =
        ReactNativeFirebaseCrashlyticsNativeHelper.class.getMethod(
            "recordNativeException", Throwable.class);
    Method log = ReactNativeFirebaseCrashlyticsNativeHelper.class.getMethod("log", String.class);
    Method setCustomKey =
        ReactNativeFirebaseCrashlyticsNativeHelper.class.getMethod(
            "setCustomKey", String.class, String.class);

    for (Method method : Arrays.asList(record, log, setCustomKey)) {
      assertTrue(method.getName(), Modifier.isStatic(method.getModifiers()));
      assertTrue(method.getName(), Modifier.isPublic(method.getModifiers()));
    }
  }

  @Test
  public void recordNativeException_forwardsToFirebaseCrashlytics() {
    FirebaseCrashlytics crashlytics = mock(FirebaseCrashlytics.class);
    Throwable throwable = new RuntimeException("native-boom");

    try (MockedStatic<FirebaseCrashlytics> firebaseCrashlytics =
        mockStatic(FirebaseCrashlytics.class)) {
      firebaseCrashlytics.when(FirebaseCrashlytics::getInstance).thenReturn(crashlytics);

      ReactNativeFirebaseCrashlyticsNativeHelper.recordNativeException(throwable);

      verify(crashlytics).recordException(throwable);
    }
  }

  @Test
  public void log_forwardsToFirebaseCrashlytics() {
    FirebaseCrashlytics crashlytics = mock(FirebaseCrashlytics.class);

    try (MockedStatic<FirebaseCrashlytics> firebaseCrashlytics =
        mockStatic(FirebaseCrashlytics.class)) {
      firebaseCrashlytics.when(FirebaseCrashlytics::getInstance).thenReturn(crashlytics);

      ReactNativeFirebaseCrashlyticsNativeHelper.log("native-log");

      verify(crashlytics).log("native-log");
    }
  }

  @Test
  public void setCustomKey_forwardsToFirebaseCrashlytics() {
    FirebaseCrashlytics crashlytics = mock(FirebaseCrashlytics.class);

    try (MockedStatic<FirebaseCrashlytics> firebaseCrashlytics =
        mockStatic(FirebaseCrashlytics.class)) {
      firebaseCrashlytics.when(FirebaseCrashlytics::getInstance).thenReturn(crashlytics);

      ReactNativeFirebaseCrashlyticsNativeHelper.setCustomKey("k", "v");

      verify(crashlytics).setCustomKey("k", "v");
    }
  }
}
