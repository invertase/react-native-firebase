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

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;

import com.google.firebase.crashlytics.FirebaseCrashlytics;
import io.invertase.firebase.common.ReactNativeFirebasePreferences;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockedStatic;
import org.robolectric.RobolectricTestRunner;

/**
 * JVM coverage for {@link NativeRNFBTurboCrashlytics#saveAndApplyCollectionEnabled(boolean)}. The
 * SDK must receive the init provider's effective value, not the raw argument, so a debug build
 * without crashlytics_debug_enabled stays disabled after setCrashlyticsCollectionEnabled(true).
 */
@RunWith(RobolectricTestRunner.class)
public class NativeRNFBTurboCrashlyticsCollectionEnabledTest {

  /** Runs the helper with the SDK, preferences and init provider stubbed; returns the SDK mock. */
  private static FirebaseCrashlytics saveAndApply(boolean enabled, boolean effective) {
    FirebaseCrashlytics crashlytics = mock(FirebaseCrashlytics.class);
    ReactNativeFirebasePreferences prefs = mock(ReactNativeFirebasePreferences.class);

    try (MockedStatic<FirebaseCrashlytics> firebaseCrashlytics =
            mockStatic(FirebaseCrashlytics.class);
        MockedStatic<ReactNativeFirebasePreferences> preferences =
            mockStatic(ReactNativeFirebasePreferences.class);
        MockedStatic<ReactNativeFirebaseCrashlyticsInitProvider> initProvider =
            mockStatic(ReactNativeFirebaseCrashlyticsInitProvider.class)) {
      firebaseCrashlytics.when(FirebaseCrashlytics::getInstance).thenReturn(crashlytics);
      preferences.when(ReactNativeFirebasePreferences::getSharedInstance).thenReturn(prefs);
      initProvider
          .when(ReactNativeFirebaseCrashlyticsInitProvider::isCrashlyticsCollectionEnabled)
          .thenReturn(effective);

      NativeRNFBTurboCrashlytics.saveAndApplyCollectionEnabled(enabled);

      verify(prefs).setBooleanValue(Constants.KEY_CRASHLYTICS_AUTO_COLLECTION_ENABLED, enabled);
    }
    return crashlytics;
  }

  @Test
  public void passesTheEffectiveValueNotTheArgument() {
    // A debug build without crashlytics_debug_enabled: the provider computes false.
    verify(saveAndApply(true, false)).setCrashlyticsCollectionEnabled(false);
  }

  @Test
  public void passesTrueWhenCollectionIsEffectivelyEnabled() {
    verify(saveAndApply(true, true)).setCrashlyticsCollectionEnabled(true);
  }

  @Test
  public void passesFalseOnWithdrawal() {
    verify(saveAndApply(false, false)).setCrashlyticsCollectionEnabled(false);
  }
}
