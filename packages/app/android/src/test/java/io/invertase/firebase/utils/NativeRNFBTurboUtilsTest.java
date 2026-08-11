package io.invertase.firebase.utils;

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
import static org.junit.Assert.assertFalse;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import com.facebook.react.bridge.ReactApplicationContext;
import io.invertase.firebase.app.ReactNativeFirebaseApp;
import java.lang.reflect.Method;
import java.util.Map;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.RuntimeEnvironment;
import org.robolectric.annotation.Config;

/**
 * JVM coverage for {@link NativeRNFBTurboUtils} appVersion constant export branches (null, empty,
 * package-manager failure).
 */
@RunWith(RobolectricTestRunner.class)
@Config(sdk = 34)
public class NativeRNFBTurboUtilsTest {

  private ReactApplicationContext reactContext;
  private PackageManager packageManager;
  private String packageName;

  @Before
  public void setUp() {
    android.app.Application application = RuntimeEnvironment.getApplication();
    ReactNativeFirebaseApp.setApplicationContext(application);

    packageName = application.getPackageName();
    packageManager = mock(PackageManager.class);

    reactContext = mock(ReactApplicationContext.class);
    when(reactContext.getApplicationContext()).thenReturn(application);
    when(reactContext.getPackageName()).thenReturn(packageName);
    when(reactContext.getPackageManager()).thenReturn(packageManager);
    when(reactContext.getFilesDir()).thenReturn(application.getFilesDir());
    when(reactContext.getCacheDir()).thenReturn(application.getCacheDir());
    when(reactContext.getExternalFilesDir(null)).thenReturn(application.getExternalFilesDir(null));
  }

  @Test
  public void getTypedExportedConstants_includesAppVersionWhenPresent() throws Exception {
    stubVersionName("4.5.6");

    Map<String, Object> constants = invokeGetTypedExportedConstants();

    assertEquals("4.5.6", constants.get("appVersion"));
  }

  @Test
  public void getTypedExportedConstants_omitsAppVersionWhenNull() throws Exception {
    stubVersionName(null);

    Map<String, Object> constants = invokeGetTypedExportedConstants();

    assertFalse(constants.containsKey("appVersion"));
  }

  @Test
  public void getTypedExportedConstants_omitsAppVersionWhenEmpty() throws Exception {
    stubVersionName("");

    Map<String, Object> constants = invokeGetTypedExportedConstants();

    assertFalse(constants.containsKey("appVersion"));
  }

  @Test
  public void getTypedExportedConstants_omitsAppVersionOnNameNotFound() throws Exception {
    when(packageManager.getPackageInfo(anyString(), anyInt()))
        .thenThrow(new NameNotFoundException(packageName));

    Map<String, Object> constants = invokeGetTypedExportedConstants();

    assertFalse(constants.containsKey("appVersion"));
  }

  private void stubVersionName(String versionName) throws Exception {
    PackageInfo packageInfo = new PackageInfo();
    packageInfo.versionName = versionName;
    when(packageManager.getPackageInfo(anyString(), anyInt())).thenReturn(packageInfo);
  }

  @SuppressWarnings("unchecked")
  private Map<String, Object> invokeGetTypedExportedConstants() throws Exception {
    NativeRNFBTurboUtils module = new NativeRNFBTurboUtils(reactContext);
    Method method = NativeRNFBTurboUtils.class.getDeclaredMethod("getTypedExportedConstants");
    method.setAccessible(true);
    return (Map<String, Object>) method.invoke(module);
  }
}
