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
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.Bundle;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.messaging.FirebaseMessaging;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockedStatic;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.shadows.ShadowLooper;

/**
 * JVM coverage for the installation-id (FID) register path of {@link NativeRNFBTurboMessaging}: the
 * manifest flag constant plus {@code register} / {@code unregister}.
 *
 * <p>Robolectric supplies the real {@code Bundle} / {@code ApplicationInfo} / main looper
 * (AndroidTest-AD-1: PackageInfo / Handler APIs). Mockito supplies the {@code PackageManager},
 * React context and {@link FirebaseMessaging} doubles; the module is built with an overridden
 * {@code firebaseMessaging()} because Mockito static mocks are thread-bound and {@code register} /
 * {@code unregister} run on the module executor thread.
 */
@RunWith(RobolectricTestRunner.class)
public class NativeRNFBTurboMessagingInstallationIdTest {

  private static final String META_KEY = "firebase_messaging_installation_id_enabled";
  private static final String PACKAGE_NAME = "com.example.messaging.test";

  private ReactApplicationContext reactContext;
  private PackageManager packageManager;

  @Before
  public void setUp() {
    packageManager = mock(PackageManager.class);
    reactContext = mock(ReactApplicationContext.class);
    when(reactContext.getPackageManager()).thenReturn(packageManager);
    when(reactContext.getPackageName()).thenReturn(PACKAGE_NAME);
  }

  private void setManifestMetaData(Bundle metaData) throws Exception {
    ApplicationInfo applicationInfo = new ApplicationInfo();
    applicationInfo.metaData = metaData;
    when(packageManager.getApplicationInfo(PACKAGE_NAME, PackageManager.GET_META_DATA))
        .thenReturn(applicationInfo);
  }

  private NativeRNFBTurboMessaging moduleWith(final FirebaseMessaging firebaseMessaging) {
    return new NativeRNFBTurboMessaging(reactContext) {
      @Override
      FirebaseMessaging firebaseMessaging() {
        return firebaseMessaging;
      }
    };
  }

  private Object installationIdConstant() {
    FirebaseMessaging messaging = mock(FirebaseMessaging.class);
    try (MockedStatic<FirebaseMessaging> statics = mockStatic(FirebaseMessaging.class)) {
      statics.when(FirebaseMessaging::getInstance).thenReturn(messaging);
      Map<String, Object> constants = moduleWith(messaging).getTypedExportedConstants();
      return constants.get("isInstallationIdEnabled");
    }
  }

  @Test
  public void constants_installationIdEnabled_whenManifestFlagTrue() throws Exception {
    Bundle metaData = new Bundle();
    metaData.putBoolean(META_KEY, true);
    setManifestMetaData(metaData);
    assertEquals(Boolean.TRUE, installationIdConstant());
  }

  @Test
  public void constants_installationIdDisabled_whenManifestFlagFalse() throws Exception {
    Bundle metaData = new Bundle();
    metaData.putBoolean(META_KEY, false);
    setManifestMetaData(metaData);
    assertEquals(Boolean.FALSE, installationIdConstant());
  }

  @Test
  public void constants_installationIdDisabled_whenFlagMissing() throws Exception {
    setManifestMetaData(new Bundle());
    assertEquals(Boolean.FALSE, installationIdConstant());
  }

  @Test
  public void constants_installationIdDisabled_whenMetaDataNull() throws Exception {
    setManifestMetaData(null);
    assertEquals(Boolean.FALSE, installationIdConstant());
  }

  @Test
  public void constants_installationIdDisabled_whenPackageNotFound() throws Exception {
    when(packageManager.getApplicationInfo(PACKAGE_NAME, PackageManager.GET_META_DATA))
        .thenThrow(new PackageManager.NameNotFoundException(PACKAGE_NAME));
    assertEquals(Boolean.FALSE, installationIdConstant());
  }

  @Test
  public void firebaseMessaging_returnsSharedInstance() {
    FirebaseMessaging messaging = mock(FirebaseMessaging.class);
    try (MockedStatic<FirebaseMessaging> statics = mockStatic(FirebaseMessaging.class)) {
      statics.when(FirebaseMessaging::getInstance).thenReturn(messaging);
      assertSame(messaging, new NativeRNFBTurboMessaging(reactContext).firebaseMessaging());
    }
  }

  @Test
  public void register_resolvesPromise_whenSdkRegisterSucceeds() throws Exception {
    FirebaseMessaging messaging = mock(FirebaseMessaging.class);
    when(messaging.register()).thenReturn(Tasks.<Void>forResult(null));
    Settled settled = new Settled();

    moduleWith(messaging).register(settled.promise());

    settled.await();
    verify(settled.promise).resolve(null);
    verify(messaging).register();
  }

  @Test
  public void register_rejectsPromise_whenSdkRegisterFails() throws Exception {
    FirebaseMessaging messaging = mock(FirebaseMessaging.class);
    Exception failure = new IllegalStateException("register failed");
    when(messaging.register()).thenReturn(Tasks.<Void>forException(failure));
    Settled settled = new Settled();

    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      arguments.when(Arguments::createMap).thenReturn(mock(WritableMap.class));
      moduleWith(messaging).register(settled.promise());
      settled.await();
    }

    assertTrue(settled.rejected());
  }

  @Test
  public void unregister_resolvesPromise_whenSdkUnregisterSucceeds() throws Exception {
    FirebaseMessaging messaging = mock(FirebaseMessaging.class);
    when(messaging.unregister()).thenReturn(Tasks.<Void>forResult(null));
    Settled settled = new Settled();

    moduleWith(messaging).unregister(settled.promise());

    settled.await();
    verify(settled.promise).resolve(null);
    verify(messaging).unregister();
  }

  @Test
  public void unregister_rejectsPromise_whenSdkUnregisterFails() throws Exception {
    FirebaseMessaging messaging = mock(FirebaseMessaging.class);
    Exception failure = new IllegalStateException("unregister failed");
    when(messaging.unregister()).thenReturn(Tasks.<Void>forException(failure));
    Settled settled = new Settled();

    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      arguments.when(Arguments::createMap).thenReturn(mock(WritableMap.class));
      moduleWith(messaging).unregister(settled.promise());
      settled.await();
    }

    assertTrue(settled.rejected());
  }

  /**
   * Promise double settled from the module executor thread plus main looper; the test thread pumps
   * the (paused) Robolectric main looper until the promise settles.
   */
  private static final class Settled {
    private final CountDownLatch latch = new CountDownLatch(1);
    final Promise promise = mock(Promise.class);
    private boolean rejected;

    Settled() {
      doAnswer(
              invocation -> {
                latch.countDown();
                return null;
              })
          .when(promise)
          .resolve(any());
      doAnswer(
              invocation -> {
                rejected = true;
                latch.countDown();
                return null;
              })
          .when(promise)
          .reject(any(Throwable.class), any(WritableMap.class));
    }

    Promise promise() {
      return promise;
    }

    boolean rejected() {
      return rejected;
    }

    void await() throws InterruptedException {
      long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(10);
      while (!latch.await(10, TimeUnit.MILLISECONDS)) {
        ShadowLooper.idleMainLooper();
        if (System.nanoTime() > deadline) {
          fail("promise was not settled");
        }
      }
      assertFalse(latch.getCount() > 0);
    }
  }
}
