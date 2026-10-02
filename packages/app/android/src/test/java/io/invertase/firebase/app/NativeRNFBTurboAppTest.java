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
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertThrows;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
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
import com.google.firebase.FirebaseOptions;
import io.invertase.firebase.common.RCTConvertFirebase;
import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import io.invertase.firebase.common.ReactNativeFirebaseJSON;
import io.invertase.firebase.common.ReactNativeFirebasePreferences;
import io.invertase.firebase.interfaces.NativeEvent;
import java.lang.ref.WeakReference;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
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
@Config(application = NativeRNFBTurboAppTest.HostApplication.class)
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

    ReactNativeFirebaseApp.setApplicationContext(application);
    NativeRNFBTurboApp.authDomains.clear();
    ReactNativeFirebasePreferences.getSharedInstance().clearAll();
    resetEmitterSharedInstance();
  }

  @Test
  public void javaAbi_preservesClassConstructorAndStaticAuthDomainSurface() throws Exception {
    assertTrue(Modifier.isPublic(NativeRNFBTurboApp.class.getModifiers()));
    assertFalse(Modifier.isFinal(NativeRNFBTurboApp.class.getModifiers()));
    assertEquals(
        com.facebook.fbreact.specs.NativeRNFBTurboAppSpec.class,
        NativeRNFBTurboApp.class.getSuperclass());
    assertTrue(
        com.facebook.react.bridge.LifecycleEventListener.class.isAssignableFrom(
            NativeRNFBTurboApp.class));

    Constructor<NativeRNFBTurboApp> constructor =
        NativeRNFBTurboApp.class.getDeclaredConstructor(ReactApplicationContext.class);
    // Kotlin cannot emit package-private. Protected is the closest JVM visibility: it preserves
    // construction from same-package Java (as every `new` in this class proves) without making the
    // constructor public; the internal companion invoke serves same-module Kotlin registration.
    assertTrue(Modifier.isProtected(constructor.getModifiers()));
    assertFalse(Modifier.isPublic(constructor.getModifiers()));

    Field field = NativeRNFBTurboApp.class.getDeclaredField("authDomains");
    assertTrue(Modifier.isPublic(field.getModifiers()));
    assertTrue(Modifier.isStatic(field.getModifiers()));
    assertTrue(Modifier.isFinal(field.getModifiers()));
    assertEquals(Map.class, field.getType());
    ParameterizedType fieldType = (ParameterizedType) field.getGenericType();
    assertEquals(String.class, fieldType.getActualTypeArguments()[0]);
    assertEquals(String.class, fieldType.getActualTypeArguments()[1]);
    assertTrue(field.get(null) instanceof ConcurrentHashMap);
    assertSame(NativeRNFBTurboApp.authDomains, field.get(null));

    Method configure =
        NativeRNFBTurboApp.class.getDeclaredMethod(
            "configureAuthDomain", String.class, String.class);
    assertTrue(Modifier.isPublic(configure.getModifiers()));
    assertTrue(Modifier.isStatic(configure.getModifiers()));
    assertEquals(void.class, configure.getReturnType());
  }

  @Test
  public void javaNullCalls_doNotGainKotlinBoundaryChecks() {
    NativeRNFBTurboApp module = new NativeRNFBTurboApp(reactContext);
    module.addListener(null);
    module.setLogLevel(null);
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
    FirebaseOptions options = mock(FirebaseOptions.class);
    when(firebaseApp.getName()).thenReturn("[DEFAULT]");
    when(firebaseApp.getOptions()).thenReturn(options);

    try (MockedStatic<FirebaseApp> firebaseApps = mockStatic(FirebaseApp.class)) {
      firebaseApps
          .when(() -> FirebaseApp.getApps(reactContext))
          .thenReturn(Collections.singletonList(firebaseApp));

      NativeRNFBTurboApp module = new NativeRNFBTurboApp(reactContext);
      Method method = NativeRNFBTurboApp.class.getDeclaredMethod("getTypedExportedConstants");
      method.setAccessible(true);
      @SuppressWarnings("unchecked")
      Map<String, Object> constants = (Map<String, Object>) method.invoke(module);

      assertEquals(
          ReactNativeFirebaseJSON.getSharedInstance().getRawJSON(),
          constants.get("FIREBASE_RAW_JSON"));
      @SuppressWarnings("unchecked")
      List<Map<String, Object>> apps =
          (List<Map<String, Object>>) constants.get("NATIVE_FIREBASE_APPS");
      assertEquals(1, apps.size());
      @SuppressWarnings("unchecked")
      Map<String, Object> appConfig = (Map<String, Object>) apps.get(0).get("appConfig");
      assertEquals("[DEFAULT]", appConfig.get("name"));
    }
  }

  @Test
  public void initializeApp_configuresAuthDomainAndResolvesPromise() {
    ReadableMap options = mock(ReadableMap.class);
    ReadableMap appConfig = mock(ReadableMap.class);
    Promise promise = mock(Promise.class);
    FirebaseApp firebaseApp = mock(FirebaseApp.class);
    FirebaseOptions firebaseOptions = mock(FirebaseOptions.class);

    when(appConfig.getString("name")).thenReturn("secondary");
    when(options.getString("apiKey")).thenReturn("api-key");
    when(options.getString("appId")).thenReturn("app-id");
    when(options.getString("authDomain")).thenReturn("example.firebaseapp.com");
    when(firebaseApp.getName()).thenReturn("secondary");
    when(firebaseApp.getOptions()).thenReturn(firebaseOptions);

    try (MockedStatic<FirebaseApp> firebaseApps = mockStatic(FirebaseApp.class);
        MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      firebaseApps
          .when(
              () ->
                  FirebaseApp.initializeApp(
                      eq(reactContext), any(FirebaseOptions.class), eq("secondary")))
          .thenReturn(firebaseApp);
      NativeRNFBTurboApp module = new NativeRNFBTurboApp(reactContext);
      module.initializeApp(options, appConfig, promise);

      assertEquals("example.firebaseapp.com", NativeRNFBTurboApp.authDomains.get("secondary"));
      firebaseApps.verify(
          () ->
              FirebaseApp.initializeApp(
                  eq(reactContext), any(FirebaseOptions.class), eq("secondary")));
      arguments.verify(() -> Arguments.makeNativeMap(anyMap()));
      verify(promise).resolve(null);
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
  public void configureAuthDomain_preservesConcurrentHashMapNullKeyFailures() {
    assertThrows(
        NullPointerException.class,
        () -> NativeRNFBTurboApp.configureAuthDomain(null, "example.firebaseapp.com"));
    assertThrows(
        NullPointerException.class, () -> NativeRNFBTurboApp.configureAuthDomain(null, null));
  }

  @Test
  public void firebaseAppToMap_includesOnlyConfiguredAuthDomain() {
    FirebaseApp firebaseApp = mock(FirebaseApp.class);
    FirebaseOptions options = mock(FirebaseOptions.class);
    when(firebaseApp.getName()).thenReturn("secondary");
    when(firebaseApp.getOptions()).thenReturn(options);

    NativeRNFBTurboApp.configureAuthDomain("secondary", "example.firebaseapp.com");
    Map<String, Object> appWithAuthDomain = RCTConvertFirebase.firebaseAppToMap(firebaseApp);
    @SuppressWarnings("unchecked")
    Map<String, Object> optionsWithAuthDomain =
        (Map<String, Object>) appWithAuthDomain.get("options");
    assertEquals("example.firebaseapp.com", optionsWithAuthDomain.get("authDomain"));

    NativeRNFBTurboApp.configureAuthDomain("secondary", null);
    Map<String, Object> appWithoutAuthDomain = RCTConvertFirebase.firebaseAppToMap(firebaseApp);
    @SuppressWarnings("unchecked")
    Map<String, Object> optionsWithoutAuthDomain =
        (Map<String, Object>) appWithoutAuthDomain.get("options");
    assertFalse(optionsWithoutAuthDomain.containsKey("authDomain"));
  }

  @Test
  public void setAutomaticDataCollectionEnabled_delegatesToFirebaseApp() {
    FirebaseApp firebaseApp = mock(FirebaseApp.class);
    try (MockedStatic<FirebaseApp> firebaseApps = mockStatic(FirebaseApp.class)) {
      firebaseApps
          .when(() -> FirebaseApp.getInstance((String) null))
          .thenAnswer(
              invocation -> {
                assertNull(invocation.getArgument(0));
                return firebaseApp;
              });

      NativeRNFBTurboApp module = new NativeRNFBTurboApp(reactContext);
      module.setAutomaticDataCollectionEnabled(null, true);

      firebaseApps.verify(() -> FirebaseApp.getInstance((String) null));
      verify(firebaseApp).setDataCollectionDefaultEnabled(true);
    }
  }

  @Test
  public void deleteApp_deletesWhenInstancePresent() {
    FirebaseApp firebaseApp = mock(FirebaseApp.class);
    Promise promise = mock(Promise.class);
    NativeRNFBTurboApp.configureAuthDomain("secondary", "example.firebaseapp.com");
    try (MockedStatic<FirebaseApp> firebaseApps = mockStatic(FirebaseApp.class)) {
      firebaseApps.when(() -> FirebaseApp.getInstance("secondary")).thenReturn(firebaseApp);

      NativeRNFBTurboApp module = new NativeRNFBTurboApp(reactContext);
      module.deleteApp("secondary", promise);

      verify(firebaseApp).delete();
      assertFalse(NativeRNFBTurboApp.authDomains.containsKey("secondary"));
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

      RuntimeException fromFirebase = new RuntimeException("from FirebaseApp.getInstance");
      firebaseApps
          .when(() -> FirebaseApp.getInstance((String) null))
          .thenAnswer(
              invocation -> {
                assertNull(invocation.getArgument(0));
                throw fromFirebase;
              });
      Promise nullNamePromise = mock(Promise.class);

      assertSame(
          fromFirebase,
          assertThrows(RuntimeException.class, () -> module.deleteApp(null, nullNamePromise)));
      firebaseApps.verify(() -> FirebaseApp.getInstance((String) null));
      verifyNoInteractions(nullNamePromise);
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
  public void eventsPing_sendsEventAndResolvesBody() throws Exception {
    ReadableMap body = mock(ReadableMap.class);
    WritableMap eventWritable = mock(WritableMap.class);
    WritableMap resolvedWritable = mock(WritableMap.class);
    WritableMap nullNameWritable = mock(WritableMap.class);
    Promise promise = mock(Promise.class);

    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      arguments
          .when(Arguments::createMap)
          .thenReturn(eventWritable, resolvedWritable, nullNameWritable);

      NativeRNFBTurboApp module = new NativeRNFBTurboApp(reactContext);
      module.eventsPing("ping_event", body, promise);
      ShadowLooper.idleMainLooper();

      verify(eventWritable).merge(body);
      verify(resolvedWritable).merge(body);
      verify(promise).resolve(resolvedWritable);
      @SuppressWarnings("unchecked")
      List<NativeEvent> queuedEvents =
          (List<NativeEvent>)
              getEmitterField("queuedEvents")
                  .get(ReactNativeFirebaseEventEmitter.getSharedInstance());
      assertEquals(1, queuedEvents.size());
      assertEquals("ping_event", queuedEvents.get(0).getEventName());
      assertSame(eventWritable, queuedEvents.get(0).getEventBody());

      Promise nullNamePromise = mock(Promise.class);
      assertThrows(
          NullPointerException.class, () -> module.eventsPing(null, body, nullNamePromise));
      verify(nullNameWritable).merge(body);
      verifyNoInteractions(nullNamePromise);
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

    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      arguments.when(Arguments::createMap).thenReturn(all);

      NativeRNFBTurboApp module = new NativeRNFBTurboApp(reactContext);
      module.metaGetAll(promise);
      verify(promise).resolve(all);
    }
  }

  @Test
  public void jsonGetAll_resolvesJsonSingleton() {
    Promise promise = mock(Promise.class);
    WritableMap all = mock(WritableMap.class);

    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      arguments.when(Arguments::createMap).thenReturn(all);

      NativeRNFBTurboApp module = new NativeRNFBTurboApp(reactContext);
      module.jsonGetAll(promise);
      verify(promise).resolve(all);
    }
  }

  @Test
  public void preferencesSettersAndGetters_delegateToPreferencesSingleton() {
    Promise boolPromise = mock(Promise.class);
    Promise stringPromise = mock(Promise.class);
    Promise getPromise = mock(Promise.class);
    Promise clearPromise = mock(Promise.class);
    WritableMap all = mock(WritableMap.class);

    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      arguments.when(Arguments::createMap).thenReturn(all);

      NativeRNFBTurboApp module = new NativeRNFBTurboApp(reactContext);
      module.preferencesSetBool("bool", true, boolPromise);
      assertTrue(ReactNativeFirebasePreferences.getSharedInstance().getBooleanValue("bool", false));
      verify(boolPromise).resolve(null);

      assertThrows(
          NullPointerException.class, () -> module.preferencesSetBool("nullPromise", true, null));
      assertTrue(
          ReactNativeFirebasePreferences.getSharedInstance().getBooleanValue("nullPromise", false));

      module.preferencesSetString("string", "v", stringPromise);
      assertEquals(
          "v", ReactNativeFirebasePreferences.getSharedInstance().getStringValue("string", null));
      verify(stringPromise).resolve(null);

      module.preferencesGetAll(getPromise);
      verify(getPromise).resolve(all);

      module.preferencesClearAll(clearPromise);
      assertFalse(ReactNativeFirebasePreferences.getSharedInstance().contains("bool"));
      assertFalse(ReactNativeFirebasePreferences.getSharedInstance().contains("string"));
      verify(clearPromise).resolve(null);
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

  private static Field getEmitterField(String name) throws Exception {
    Field field = ReactNativeFirebaseEventEmitter.class.getDeclaredField(name);
    field.setAccessible(true);
    return field;
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
