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
 *
 */

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import android.app.Application;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactHost;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.google.firebase.FirebaseApp;
import io.invertase.firebase.common.RCTConvertFirebase;
import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import io.invertase.firebase.common.ReactNativeFirebaseJSON;
import io.invertase.firebase.common.ReactNativeFirebaseMeta;
import io.invertase.firebase.common.ReactNativeFirebasePreferences;
import java.lang.ref.WeakReference;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockedStatic;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.annotation.Config;
import org.robolectric.shadows.ShadowLooper;

/**
 * JVM LINE coverage for {@link NativeRNFBTurboApp} — lifecycle, constants, app CRUD, events, and
 * preferences bridges.
 */
@RunWith(RobolectricTestRunner.class)
@Config(sdk = 34, application = NativeRNFBTurboAppTest.HostApplication.class)
public class NativeRNFBTurboAppTest {

  public static class HostApplication extends Application implements ReactApplication {
    ReactHost reactHost;

    @Override
    public ReactNativeHost getReactNativeHost() {
      throw new RuntimeException("bridgeless-only test host");
    }

    @Override
    public ReactHost getReactHost() {
      return reactHost;
    }
  }

  private HostApplication application;
  private ReactHost reactHost;
  private ReactApplicationContext reactContext;

  @Before
  public void setUp() throws Exception {
    application = (HostApplication) org.robolectric.RuntimeEnvironment.getApplication();
    reactHost = mock(ReactHost.class);
    application.reactHost = reactHost;

    reactContext = mock(ReactApplicationContext.class);
    when(reactContext.getApplicationContext()).thenReturn(application);
    when(reactContext.hasActiveReactInstance()).thenReturn(true);
    when(reactHost.getCurrentReactContext()).thenReturn(reactContext);

    NativeRNFBTurboApp.authDomains.clear();
    resetEmitterSharedInstance();
  }

  @Test
  public void initialize_registersLifecycleListenerAndAttachesEmitter() throws Exception {
    NativeRNFBTurboApp module = new NativeRNFBTurboApp(reactContext);
    module.initialize();
    ShadowLooper.idleMainLooper();

    verify(reactContext).addLifecycleEventListener(module);
    assertEquals(reactContext, attachedContext());
  }

  @Test
  public void invalidate_removesLifecycleListenerAndDetachesEmitter() throws Exception {
    NativeRNFBTurboApp module = new NativeRNFBTurboApp(reactContext);
    ReactNativeFirebaseEventEmitter.getSharedInstance().attachReactContext(reactContext);
    ShadowLooper.idleMainLooper();

    module.invalidate();
    ShadowLooper.idleMainLooper();

    verify(reactContext).removeLifecycleEventListener(module);
    assertNull(attachedContext());
  }

  @Test
  public void onHostResume_reattachesEmitter() throws Exception {
    NativeRNFBTurboApp module = new NativeRNFBTurboApp(reactContext);
    module.onHostResume();
    ShadowLooper.idleMainLooper();
    assertEquals(reactContext, attachedContext());
  }

  @Test
  public void onHostPause_and_onHostDestroy_areNoOps() {
    NativeRNFBTurboApp module = new NativeRNFBTurboApp(reactContext);
    module.onHostPause();
    module.onHostDestroy();
  }

  @Test
  public void getTypedExportedConstants_includesAppsAndRawJson() throws Exception {
    FirebaseApp firebaseApp = mock(FirebaseApp.class);
    Map<String, Object> appMap = new HashMap<>();
    appMap.put("name", "[DEFAULT]");

    try (MockedStatic<FirebaseApp> firebaseApps = mockStatic(FirebaseApp.class);
        MockedStatic<RCTConvertFirebase> convert = mockStatic(RCTConvertFirebase.class);
        MockedStatic<ReactNativeFirebaseJSON> jsonStatic =
            mockStatic(ReactNativeFirebaseJSON.class)) {
      firebaseApps
          .when(() -> FirebaseApp.getApps(reactContext))
          .thenReturn(Collections.singletonList(firebaseApp));
      convert.when(() -> RCTConvertFirebase.firebaseAppToMap(firebaseApp)).thenReturn(appMap);

      ReactNativeFirebaseJSON json = mock(ReactNativeFirebaseJSON.class);
      jsonStatic.when(ReactNativeFirebaseJSON::getSharedInstance).thenReturn(json);
      when(json.getRawJSON()).thenReturn("{}");

      NativeRNFBTurboApp module = new NativeRNFBTurboApp(reactContext);
      Method method = NativeRNFBTurboApp.class.getDeclaredMethod("getTypedExportedConstants");
      method.setAccessible(true);
      @SuppressWarnings("unchecked")
      Map<String, Object> constants = (Map<String, Object>) method.invoke(module);

      assertEquals("{}", constants.get("FIREBASE_RAW_JSON"));
      @SuppressWarnings("unchecked")
      List<Map<String, Object>> apps =
          (List<Map<String, Object>>) constants.get("NATIVE_FIREBASE_APPS");
      assertEquals(1, apps.size());
      assertEquals("[DEFAULT]", apps.get(0).get("name"));
    }
  }

  @Test
  public void initializeApp_configuresAuthDomainAndResolvesPromise() {
    ReadableMap options = mock(ReadableMap.class);
    ReadableMap appConfig = mock(ReadableMap.class);
    Promise promise = mock(Promise.class);
    FirebaseApp firebaseApp = mock(FirebaseApp.class);
    WritableMap writableMap = mock(WritableMap.class);

    when(appConfig.getString("name")).thenReturn("secondary");
    when(options.getString("authDomain")).thenReturn("example.firebaseapp.com");

    try (MockedStatic<RCTConvertFirebase> convert = mockStatic(RCTConvertFirebase.class)) {
      convert
          .when(() -> RCTConvertFirebase.readableMapToFirebaseApp(options, appConfig, reactContext))
          .thenReturn(firebaseApp);
      convert
          .when(() -> RCTConvertFirebase.firebaseAppToWritableMap(firebaseApp))
          .thenReturn(writableMap);

      NativeRNFBTurboApp module = new NativeRNFBTurboApp(reactContext);
      module.initializeApp(options, appConfig, promise);

      assertEquals("example.firebaseapp.com", NativeRNFBTurboApp.authDomains.get("secondary"));
      verify(promise).resolve(writableMap);
    }
  }

  @Test
  public void configureAuthDomain_putsAndRemovesEntries() {
    NativeRNFBTurboApp.configureAuthDomain("secondary", "example.firebaseapp.com");
    assertEquals("example.firebaseapp.com", NativeRNFBTurboApp.authDomains.get("secondary"));
    NativeRNFBTurboApp.configureAuthDomain("secondary", null);
    assertFalse(NativeRNFBTurboApp.authDomains.containsKey("secondary"));
  }

  @Test
  public void setAutomaticDataCollectionEnabled_delegatesToFirebaseApp() {
    FirebaseApp firebaseApp = mock(FirebaseApp.class);
    try (MockedStatic<FirebaseApp> firebaseApps = mockStatic(FirebaseApp.class)) {
      firebaseApps.when(() -> FirebaseApp.getInstance("secondary")).thenReturn(firebaseApp);

      NativeRNFBTurboApp module = new NativeRNFBTurboApp(reactContext);
      module.setAutomaticDataCollectionEnabled("secondary", true);

      verify(firebaseApp).setDataCollectionDefaultEnabled(true);
    }
  }

  @Test
  public void deleteApp_deletesWhenInstancePresent() {
    FirebaseApp firebaseApp = mock(FirebaseApp.class);
    Promise promise = mock(Promise.class);
    try (MockedStatic<FirebaseApp> firebaseApps = mockStatic(FirebaseApp.class)) {
      firebaseApps.when(() -> FirebaseApp.getInstance("secondary")).thenReturn(firebaseApp);

      NativeRNFBTurboApp module = new NativeRNFBTurboApp(reactContext);
      module.deleteApp("secondary", promise);

      verify(firebaseApp).delete();
      verify(promise).resolve(null);
    }
  }

  @Test
  public void deleteApp_resolvesWhenInstanceNull() {
    Promise promise = mock(Promise.class);
    try (MockedStatic<FirebaseApp> firebaseApps = mockStatic(FirebaseApp.class)) {
      firebaseApps.when(() -> FirebaseApp.getInstance("missing")).thenReturn(null);

      NativeRNFBTurboApp module = new NativeRNFBTurboApp(reactContext);
      module.deleteApp("missing", promise);

      verify(promise).resolve(null);
    }
  }

  @Test
  public void eventsNotifyReady_forwardsToEmitter() throws Exception {
    NativeRNFBTurboApp module = new NativeRNFBTurboApp(reactContext);
    module.eventsNotifyReady(true);
    Field field = ReactNativeFirebaseEventEmitter.class.getDeclaredField("jsReady");
    field.setAccessible(true);
    assertTrue(field.getBoolean(ReactNativeFirebaseEventEmitter.getSharedInstance()));
  }

  @Test
  public void eventsGetListeners_resolvesEmitterMap() {
    Promise promise = mock(Promise.class);
    WritableMap listenersMap = mock(WritableMap.class);
    WritableMap eventsMap = mock(WritableMap.class);

    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      arguments.when(Arguments::createMap).thenReturn(listenersMap, eventsMap);

      NativeRNFBTurboApp module = new NativeRNFBTurboApp(reactContext);
      module.eventsGetListeners(promise);

      verify(promise).resolve(listenersMap);
    }
  }

  @Test
  public void eventsPing_sendsEventAndResolvesBody() {
    ReadableMap body = mock(ReadableMap.class);
    WritableMap writable = mock(WritableMap.class);
    Promise promise = mock(Promise.class);

    try (MockedStatic<RCTConvertFirebase> convert = mockStatic(RCTConvertFirebase.class)) {
      convert.when(() -> RCTConvertFirebase.readableMapToWritableMap(body)).thenReturn(writable);

      NativeRNFBTurboApp module = new NativeRNFBTurboApp(reactContext);
      module.eventsPing("ping_event", body, promise);

      verify(promise).resolve(writable);
    }
  }

  @Test
  public void eventsAddAndRemoveListener_delegateToEmitter() throws Exception {
    NativeRNFBTurboApp module = new NativeRNFBTurboApp(reactContext);
    module.eventsAddListener("auth_state_changed");
    ShadowLooper.idleMainLooper();

    Field field = ReactNativeFirebaseEventEmitter.class.getDeclaredField("jsListeners");
    field.setAccessible(true);
    @SuppressWarnings("unchecked")
    Map<String, Integer> listeners =
        (Map<String, Integer>) field.get(ReactNativeFirebaseEventEmitter.getSharedInstance());
    assertEquals(Integer.valueOf(1), listeners.get("auth_state_changed"));

    module.eventsRemoveListener("auth_state_changed", true);
    assertFalse(listeners.containsKey("auth_state_changed"));
  }

  @Test
  public void addListener_and_removeListeners_areNoOpsForRnBuiltInEmitter() {
    NativeRNFBTurboApp module = new NativeRNFBTurboApp(reactContext);
    module.addListener("rn_builtin");
    module.removeListeners(1);
  }

  @Test
  public void metaGetAll_resolvesMetaSingleton() {
    Promise promise = mock(Promise.class);
    WritableMap all = mock(WritableMap.class);
    ReactNativeFirebaseMeta meta = mock(ReactNativeFirebaseMeta.class);
    when(meta.getAll()).thenReturn(all);

    try (MockedStatic<ReactNativeFirebaseMeta> metaStatic =
        mockStatic(ReactNativeFirebaseMeta.class)) {
      metaStatic.when(ReactNativeFirebaseMeta::getSharedInstance).thenReturn(meta);

      NativeRNFBTurboApp module = new NativeRNFBTurboApp(reactContext);
      module.metaGetAll(promise);
      verify(promise).resolve(all);
    }
  }

  @Test
  public void jsonGetAll_resolvesJsonSingleton() {
    Promise promise = mock(Promise.class);
    WritableMap all = mock(WritableMap.class);
    ReactNativeFirebaseJSON json = mock(ReactNativeFirebaseJSON.class);
    when(json.getAll()).thenReturn(all);

    try (MockedStatic<ReactNativeFirebaseJSON> jsonStatic =
        mockStatic(ReactNativeFirebaseJSON.class)) {
      jsonStatic.when(ReactNativeFirebaseJSON::getSharedInstance).thenReturn(json);

      NativeRNFBTurboApp module = new NativeRNFBTurboApp(reactContext);
      module.jsonGetAll(promise);
      verify(promise).resolve(all);
    }
  }

  @Test
  public void preferencesSettersAndGetters_delegateToPreferencesSingleton() {
    Promise promise = mock(Promise.class);
    WritableMap all = mock(WritableMap.class);
    ReactNativeFirebasePreferences prefs = mock(ReactNativeFirebasePreferences.class);
    when(prefs.getAll()).thenReturn(all);

    try (MockedStatic<ReactNativeFirebasePreferences> prefsStatic =
        mockStatic(ReactNativeFirebasePreferences.class)) {
      prefsStatic.when(ReactNativeFirebasePreferences::getSharedInstance).thenReturn(prefs);

      NativeRNFBTurboApp module = new NativeRNFBTurboApp(reactContext);
      module.preferencesSetBool("k", true, promise);
      verify(prefs).setBooleanValue("k", true);
      verify(promise).resolve(null);

      module.preferencesSetString("k", "v", promise);
      verify(prefs).setStringValue("k", "v");

      module.preferencesGetAll(promise);
      verify(promise).resolve(all);

      module.preferencesClearAll(promise);
      verify(prefs).clearAll();
    }
  }

  @Test
  public void setLogLevel_isNoOp() {
    NativeRNFBTurboApp module = new NativeRNFBTurboApp(reactContext);
    module.setLogLevel("debug");
  }

  private static void resetEmitterSharedInstance() throws Exception {
    Constructor<ReactNativeFirebaseEventEmitter> ctor =
        ReactNativeFirebaseEventEmitter.class.getDeclaredConstructor();
    ctor.setAccessible(true);
    ReactNativeFirebaseEventEmitter fresh = ctor.newInstance();
    Field shared = ReactNativeFirebaseEventEmitter.class.getDeclaredField("sharedInstance");
    shared.setAccessible(true);
    shared.set(null, fresh);
  }

  @SuppressWarnings("unchecked")
  private static ReactContext attachedContext() throws Exception {
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    Field field = ReactNativeFirebaseEventEmitter.class.getDeclaredField("attachedReactContext");
    field.setAccessible(true);
    WeakReference<ReactContext> ref = (WeakReference<ReactContext>) field.get(emitter);
    return ref.get();
  }
}
