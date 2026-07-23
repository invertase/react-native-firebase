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
 *
 */

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import android.app.Application;
import android.content.Context;
import androidx.annotation.Nullable;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactHost;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import io.invertase.firebase.app.ReactNativeFirebaseApp;
import io.invertase.firebase.interfaces.NativeEvent;
import java.lang.ref.WeakReference;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockedStatic;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.annotation.Config;
import org.robolectric.shadows.ShadowLooper;

/**
 * JVM coverage for {@link ReactNativeFirebaseEventEmitter} ReactContext generation overlap.
 *
 * <p>Uses Robolectric for {@link android.os.Handler}/{@link android.os.Looper} and Mockito for RN
 * host/context doubles. The contracts under test are Java state-machine behaviour and do not
 * require the Detox/Jet harness.
 */
@RunWith(RobolectricTestRunner.class)
@Config(sdk = 34, application = ReactNativeFirebaseEventEmitterTest.HostApplication.class)
public class ReactNativeFirebaseEventEmitterTest {

  private static final String EVENT = "auth_state_changed";

  private HostApplication application;
  private ReactHost reactHost;
  private ReactContext staleContext;
  private ReactContext liveContext;
  private DeviceEventManagerModule.RCTDeviceEventEmitter staleJsEmitter;
  private DeviceEventManagerModule.RCTDeviceEventEmitter liveJsEmitter;
  private WritableMap eventBody;

  public static class HostApplication extends Application implements ReactApplication {
    ReactHost reactHost;
    ReactNativeHost reactNativeHost;

    @Override
    public ReactNativeHost getReactNativeHost() {
      if (reactNativeHost == null) {
        throw new RuntimeException("bridgeless-only test host");
      }
      return reactNativeHost;
    }

    @Override
    public ReactHost getReactHost() {
      return reactHost;
    }
  }

  @Before
  public void setUp() throws Exception {
    application = (HostApplication) org.robolectric.RuntimeEnvironment.getApplication();
    reactHost = mock(ReactHost.class);
    application.reactHost = reactHost;
    application.reactNativeHost = null;

    staleContext = mock(ReactContext.class);
    liveContext = mock(ReactContext.class);
    staleJsEmitter = mock(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
    liveJsEmitter = mock(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
    eventBody = mock(WritableMap.class);

    when(staleContext.getApplicationContext()).thenReturn(application);
    when(liveContext.getApplicationContext()).thenReturn(application);
    // Bridgeless stale contexts still report an active instance via host-level state.
    when(staleContext.hasActiveReactInstance()).thenReturn(true);
    when(liveContext.hasActiveReactInstance()).thenReturn(true);
    when(staleContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class))
        .thenReturn(staleJsEmitter);
    when(liveContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class))
        .thenReturn(liveJsEmitter);

    resetSharedInstance();
  }

  /**
   * Emit must target the host's current ReactContext, not a previously attached generation that no
   * longer hosts JS listeners.
   */
  @Test
  public void emit_deliversToHostCurrentContext_whenAttachedContextIsStale() {
    when(reactHost.getCurrentReactContext()).thenReturn(staleContext);

    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();

    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);

    emitter.notifyJsReady(true);
    ShadowLooper.idleMainLooper();
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    emitter.sendEvent(event(EVENT, eventBody));
    ShadowLooper.idleMainLooper();

    verify(liveJsEmitter).emit(eq("rnfb_" + EVENT), eq(eventBody));
    verify(staleJsEmitter, never()).emit(anyString(), eq(eventBody));
  }

  /**
   * When the host cannot name a current context (reload gap), a late attach from a dying generation
   * must not displace the live attachment, and a subsequent detach of that dying context must not
   * clear live listener / jsReady state.
   */
  @Test
  public void attachDetach_preservesLiveListeners_whenHostCurrentNullAndStaleOverlaps()
      throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);

    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    emitter.notifyJsReady(true);
    ShadowLooper.idleMainLooper();
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    assertEquals(1, listenerCount(emitter, EVENT));
    assertTrue(jsReady(emitter));

    when(reactHost.getCurrentReactContext()).thenReturn(null);
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();

    emitter.detachReactContext(staleContext);
    ShadowLooper.idleMainLooper();

    assertEquals(
        "live jsListeners must survive late stale attach+detach when host current is null",
        1,
        listenerCount(emitter, EVENT));
    assertTrue(
        "jsReady must survive late stale attach+detach when host current is null",
        jsReady(emitter));
    assertEquals(
        "attached context must remain the live generation", liveContext, attachedContext(emitter));
    assertDiagnostics(emitter, /* jsReady= */ true, liveContext, /* current= */ null);
  }

  /**
   * Live module initialize while the host still names the dying context must converge: pending
   * attach is promoted on dying detach, listeners registered by the live JS survive, and emit
   * prefers the promoted attachment over the lagging host current.
   */
  @Test
  public void attachDetachEmit_convergesToLiveContext_whenHostLagsOnDyingGeneration()
      throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(staleContext);

    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();

    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();
    assertEquals(staleContext, attachedContext(emitter));
    assertEquals(liveContext, pendingContext(emitter));

    emitter.notifyJsReady(true);
    ShadowLooper.idleMainLooper();
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    emitter.detachReactContext(staleContext);
    ShadowLooper.idleMainLooper();

    assertEquals(liveContext, attachedContext(emitter));
    assertEquals(1, listenerCount(emitter, EVENT));
    assertTrue(jsReady(emitter));

    // Host still names dying generation; emit must not deliver into it.
    emitter.sendEvent(event(EVENT, eventBody));
    ShadowLooper.idleMainLooper();

    verify(liveJsEmitter).emit(eq("rnfb_" + EVENT), eq(eventBody));
    verify(staleJsEmitter, never()).emit(anyString(), eq(eventBody));

    assertDiagnostics(emitter, /* jsReady= */ true, liveContext, staleContext);
  }

  /**
   * After the live generation has converged ahead of the host, a late attach of the lagging host
   * current must not overwrite the live attachment.
   */
  @Test
  public void attach_rejectsHostLagContext_afterLiveGenerationPromoted() throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(staleContext);

    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();
    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();
    emitter.detachReactContext(staleContext);
    ShadowLooper.idleMainLooper();

    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();

    assertEquals(liveContext, attachedContext(emitter));
    assertEquals(1, listenerCount(emitter, EVENT));
    assertTrue(jsReady(emitter));
  }

  /**
   * When the host catches up to a pending live context before the dying generation detaches,
   * attachment converges without wiping listener registrations already made by live JS.
   */
  @Test
  public void attach_convergesPending_whenHostCatchesUpBeforeDyingDetach() throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(staleContext);

    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    assertEquals(liveContext, attachedContext(emitter));
    assertEquals(1, listenerCount(emitter, EVENT));
    assertTrue(jsReady(emitter));
    assertEquals(null, pendingContext(emitter));

    emitter.sendEvent(event(EVENT, eventBody));
    ShadowLooper.idleMainLooper();
    verify(liveJsEmitter).emit(eq("rnfb_" + EVENT), eq(eventBody));
  }

  /**
   * A confirmed host switch onto a new context resets listener and jsReady accounting that belonged
   * to the previous generation.
   */
  @Test
  public void attach_resetsListenerState_onHostConfirmedContextSwitch() throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(staleContext);

    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();
    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    assertEquals(liveContext, attachedContext(emitter));
    assertEquals(0, listenerCount(emitter, EVENT));
    assertFalse(jsReady(emitter));
    assertDiagnostics(emitter, /* jsReady= */ false, liveContext, liveContext);
  }

  /**
   * Dying detach after the pointer already moved to the live generation is a no-op for listener
   * state.
   */
  @Test
  public void detach_isNoOp_whenAttachedPointerAlreadyMoved() throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);

    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();
    // Force live attach while host already names live (confirmed switch).
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();
    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    emitter.detachReactContext(staleContext);
    ShadowLooper.idleMainLooper();

    assertEquals(liveContext, attachedContext(emitter));
    assertEquals(1, listenerCount(emitter, EVENT));
    assertTrue(jsReady(emitter));
  }

  /**
   * When ReactHost is present but reports a null current context, resolution falls through to
   * ReactNativeHost so hybrid hosts still participate in arbitration.
   */
  @Test
  public void hostResolution_fallsThroughToReactNativeHost_whenReactHostCurrentNull()
      throws Exception {
    ReactNativeHost reactNativeHost = mock(ReactNativeHost.class);
    ReactInstanceManager instanceManager = mock(ReactInstanceManager.class);
    application.reactNativeHost = reactNativeHost;
    when(reactHost.getCurrentReactContext()).thenReturn(null);
    when(reactNativeHost.hasInstance()).thenReturn(true);
    when(reactNativeHost.getReactInstanceManager()).thenReturn(instanceManager);
    when(instanceManager.getCurrentReactContext()).thenReturn(liveContext);

    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();
    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    // Confirmed switch via bridge host fallthrough.
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    assertEquals(liveContext, attachedContext(emitter));
    assertEquals(0, listenerCount(emitter, EVENT));
    assertFalse(jsReady(emitter));
    assertDiagnostics(emitter, /* jsReady= */ false, liveContext, liveContext);
  }

  /**
   * Emit prefers the pending live context while the host/attached pointer still names the dying
   * generation, without waiting for dying detach.
   */
  @Test
  public void emit_deliversToPendingLiveContext_whileHostStillOnDyingGeneration() {
    when(reactHost.getCurrentReactContext()).thenReturn(staleContext);

    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    emitter.sendEvent(event(EVENT, eventBody));
    ShadowLooper.idleMainLooper();

    verify(liveJsEmitter).emit(eq("rnfb_" + EVENT), eq(eventBody));
    verify(staleJsEmitter, never()).emit(anyString(), eq(eventBody));
  }

  /**
   * Dying same-context re-attach (resume) while the host still names the dying generation must not
   * wipe a different pending live replacement — otherwise dying detach later resets listeners for
   * the rest of the session (#8374-class).
   */
  @Test
  public void attach_preservesPending_whenDyingSameContextReattachWhileHostLags() throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(staleContext);

    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    assertEquals(staleContext, attachedContext(emitter));
    assertEquals(liveContext, pendingContext(emitter));

    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();
    assertEquals(1, listenerCount(emitter, EVENT));

    // Dying generation resume / re-attach while host still names it.
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();

    assertEquals(
        "pending live replacement must survive dying same-context re-attach",
        liveContext,
        pendingContext(emitter));
    assertEquals(staleContext, attachedContext(emitter));
    assertEquals(staleContext, hostLagContext(emitter));
    assertEquals(1, listenerCount(emitter, EVENT));
    assertTrue(jsReady(emitter));

    emitter.detachReactContext(staleContext);
    ShadowLooper.idleMainLooper();
    assertEquals(liveContext, attachedContext(emitter));
    assertEquals(1, listenerCount(emitter, EVENT));
    assertTrue(jsReady(emitter));

    emitter.sendEvent(event(EVENT, eventBody));
    ShadowLooper.idleMainLooper();
    verify(liveJsEmitter).emit(eq("rnfb_" + EVENT), eq(eventBody));
    verify(staleJsEmitter, never()).emit(anyString(), eq(eventBody));
  }

  /**
   * Pending-only invalidate must cancel the pending slot rather than early-returning on the
   * attached-identity check, and must restore the surviving attached generation's listener /
   * jsReady snapshot taken when pending first entered — otherwise the dying JS (which already
   * registered once) leaves the attached runtime deaf for the rest of the session.
   */
  @Test
  public void detach_restoresAttachedListeners_whenPendingOnlyCancelled() throws Exception {
    ReactContext doomedPending = mock(ReactContext.class);
    DeviceEventManagerModule.RCTDeviceEventEmitter doomedJsEmitter =
        mock(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
    when(doomedPending.getApplicationContext()).thenReturn(application);
    when(doomedPending.hasActiveReactInstance()).thenReturn(true);
    when(doomedPending.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class))
        .thenReturn(doomedJsEmitter);

    when(reactHost.getCurrentReactContext()).thenReturn(staleContext);

    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();

    // Attached generation registers before pending enters.
    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();
    assertEquals(1, listenerCount(emitter, EVENT));
    assertTrue(jsReady(emitter));

    emitter.attachReactContext(doomedPending);
    ShadowLooper.idleMainLooper();

    assertEquals(doomedPending, pendingContext(emitter));
    assertEquals(staleContext, attachedContext(emitter));
    assertEquals(
        "pending entry resets live map so events queue until pending JS re-registers",
        0,
        listenerCount(emitter, EVENT));
    assertFalse(jsReady(emitter));

    // Pending JS registers its own accounting (must be discarded on cancel, not kept).
    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();
    assertEquals(1, listenerCount(emitter, EVENT));

    emitter.detachReactContext(doomedPending);
    ShadowLooper.idleMainLooper();

    assertEquals(null, pendingContext(emitter));
    assertEquals(null, hostLagContext(emitter));
    assertEquals(staleContext, attachedContext(emitter));
    assertEquals(
        "pending-only cancel must restore attached generation listener accounting",
        1,
        listenerCount(emitter, EVENT));
    assertTrue("pending-only cancel must restore attached generation jsReady", jsReady(emitter));

    emitter.sendEvent(event(EVENT, eventBody));
    ShadowLooper.idleMainLooper();
    verify(staleJsEmitter).emit(eq("rnfb_" + EVENT), eq(eventBody));
    verify(doomedJsEmitter, never()).emit(anyString(), eq(eventBody));
  }

  /**
   * Events raised while pending entry wiped attached listeners are queued. Pending-only cancel must
   * restore accounting and flush the queue — attached JS will not re-register.
   */
  @Test
  public void detach_flushesQueuedEvents_whenPendingOnlyCancelledAfterQueueDuringWipe()
      throws Exception {
    ReactContext doomedPending = mock(ReactContext.class);
    DeviceEventManagerModule.RCTDeviceEventEmitter doomedJsEmitter =
        mock(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
    when(doomedPending.getApplicationContext()).thenReturn(application);
    when(doomedPending.hasActiveReactInstance()).thenReturn(true);
    when(doomedPending.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class))
        .thenReturn(doomedJsEmitter);

    when(reactHost.getCurrentReactContext()).thenReturn(staleContext);

    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();

    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    emitter.attachReactContext(doomedPending);
    ShadowLooper.idleMainLooper();
    assertEquals(0, listenerCount(emitter, EVENT));
    assertFalse(jsReady(emitter));

    // Queued during the wiped pending window (messaging-style / #8374-class).
    emitter.sendEvent(event(EVENT, eventBody));
    ShadowLooper.idleMainLooper();
    assertEquals(1, queuedCount(emitter));
    verify(staleJsEmitter, never()).emit(anyString(), eq(eventBody));
    verify(doomedJsEmitter, never()).emit(anyString(), eq(eventBody));

    emitter.detachReactContext(doomedPending);
    ShadowLooper.idleMainLooper();

    assertEquals(0, queuedCount(emitter));
    verify(staleJsEmitter).emit(eq("rnfb_" + EVENT), eq(eventBody));
    verify(doomedJsEmitter, never()).emit(anyString(), eq(eventBody));
  }

  /**
   * Same pending identity re-attach while the host still names the dying generation (async
   * onHostResume / NativeRNFBTurboApp) must not resetListenerState — otherwise live JS
   * registrations made after the first pending entry are wiped for the rest of the session
   * (#8374-class).
   */
  @Test
  public void attach_preservesPendingListeners_whenSamePendingReattachWhileHostLags()
      throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(staleContext);

    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    assertEquals(staleContext, attachedContext(emitter));
    assertEquals(liveContext, pendingContext(emitter));

    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();
    assertEquals(1, listenerCount(emitter, EVENT));
    assertTrue(jsReady(emitter));

    // Same pending identity re-attach while host still lags (e.g. onHostResume).
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    assertEquals(liveContext, pendingContext(emitter));
    assertEquals(staleContext, attachedContext(emitter));
    assertEquals(staleContext, hostLagContext(emitter));
    assertEquals(
        "same-pending re-attach must not wipe listeners registered after first pending entry",
        1,
        listenerCount(emitter, EVENT));
    assertTrue(
        "same-pending re-attach must not clear jsReady registered after first pending entry",
        jsReady(emitter));

    emitter.detachReactContext(staleContext);
    ShadowLooper.idleMainLooper();
    assertEquals(liveContext, attachedContext(emitter));
    assertEquals(1, listenerCount(emitter, EVENT));
    assertTrue(jsReady(emitter));

    emitter.sendEvent(event(EVENT, eventBody));
    ShadowLooper.idleMainLooper();
    verify(liveJsEmitter).emit(eq("rnfb_" + EVENT), eq(eventBody));
    verify(staleJsEmitter, never()).emit(anyString(), eq(eventBody));
  }

  /**
   * Detach of a superseded (non-current) pending identity must not wipe listener / jsReady state
   * owned by a newer live pending candidate.
   */
  @Test
  public void detach_doesNotClearListeners_whenSupersededPendingDetaches() throws Exception {
    ReactContext middlePending = mock(ReactContext.class);
    DeviceEventManagerModule.RCTDeviceEventEmitter middleJsEmitter =
        mock(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
    when(middlePending.getApplicationContext()).thenReturn(application);
    when(middlePending.hasActiveReactInstance()).thenReturn(true);
    when(middlePending.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class))
        .thenReturn(middleJsEmitter);

    when(reactHost.getCurrentReactContext()).thenReturn(staleContext);

    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();
    emitter.attachReactContext(middlePending);
    ShadowLooper.idleMainLooper();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();
    assertEquals(liveContext, pendingContext(emitter));
    assertEquals(1, listenerCount(emitter, EVENT));

    emitter.detachReactContext(middlePending);
    ShadowLooper.idleMainLooper();

    assertEquals(liveContext, pendingContext(emitter));
    assertEquals(1, listenerCount(emitter, EVENT));
    assertTrue(jsReady(emitter));
  }

  /**
   * A third overlapping candidate while the host still names the dying attached generation is
   * last-writer-wins: pending becomes the newest candidate and prior pending listener accounting is
   * reset so the newest JS re-registers.
   */
  @Test
  public void attach_pendingLastWriterWins_whenThirdOverlappingCandidateArrives() throws Exception {
    ReactContext middlePending = mock(ReactContext.class);
    DeviceEventManagerModule.RCTDeviceEventEmitter middleJsEmitter =
        mock(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
    when(middlePending.getApplicationContext()).thenReturn(application);
    when(middlePending.hasActiveReactInstance()).thenReturn(true);
    when(middlePending.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class))
        .thenReturn(middleJsEmitter);

    when(reactHost.getCurrentReactContext()).thenReturn(staleContext);

    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();
    emitter.attachReactContext(middlePending);
    ShadowLooper.idleMainLooper();

    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();
    assertEquals(middlePending, pendingContext(emitter));
    assertEquals(1, listenerCount(emitter, EVENT));

    // Third overlapping generation while host still on dying attached.
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    assertEquals(liveContext, pendingContext(emitter));
    assertEquals(staleContext, attachedContext(emitter));
    assertEquals(staleContext, hostLagContext(emitter));
    assertEquals(
        "last-writer-wins pending must reset prior pending listener accounting",
        0,
        listenerCount(emitter, EVENT));
    assertFalse(jsReady(emitter));

    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    // Detach of superseded middle pending must not clear the newer pending.
    emitter.detachReactContext(middlePending);
    ShadowLooper.idleMainLooper();
    assertEquals(liveContext, pendingContext(emitter));

    emitter.detachReactContext(staleContext);
    ShadowLooper.idleMainLooper();
    assertEquals(liveContext, attachedContext(emitter));
    assertEquals(1, listenerCount(emitter, EVENT));

    emitter.sendEvent(event(EVENT, eventBody));
    ShadowLooper.idleMainLooper();
    verify(liveJsEmitter).emit(eq("rnfb_" + EVENT), eq(eventBody));
    verify(middleJsEmitter, never()).emit(anyString(), eq(eventBody));
    verify(staleJsEmitter, never()).emit(anyString(), eq(eventBody));
  }

  /**
   * When something is already attached and the host names a third context, an attach candidate that
   * is neither host-current nor the previous attachment is ignored (fail-closed).
   */
  @Test
  public void attach_ignoresNonCurrentCandidate_whenHostAlreadyMovedToThirdContext()
      throws Exception {
    ReactContext thirdContext = mock(ReactContext.class);
    when(thirdContext.getApplicationContext()).thenReturn(application);
    when(thirdContext.hasActiveReactInstance()).thenReturn(true);

    when(reactHost.getCurrentReactContext()).thenReturn(staleContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();

    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);
    // Candidate is neither host current (live) nor previous attached (stale).
    emitter.attachReactContext(thirdContext);
    ShadowLooper.idleMainLooper();

    assertEquals(staleContext, attachedContext(emitter));
    assertNull(pendingContext(emitter));
  }

  /**
   * Detach of the sole attached generation with no pending replacement clears attachment, listener
   * accounting, and convergence slots while intentionally retaining queued events.
   */
  @Test
  public void detach_clearsAttachedState_whenNoPendingReplacement() throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();
    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    emitter.detachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    assertNull(attachedContext(emitter));
    assertNull(pendingContext(emitter));
    assertNull(hostLagContext(emitter));
    assertEquals(0, listenerCount(emitter, EVENT));
    assertFalse(jsReady(emitter));
  }

  /** Repeated addListener for the same event increments the per-event count. */
  @Test
  public void addListener_incrementsExistingEventCount() throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    emitter.addListener(EVENT);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    assertEquals(2, listenerCount(emitter, EVENT));
  }

  /** removeListener(all=false) with count &gt; 1 decrements rather than removing the key. */
  @Test
  public void removeListener_decrementsWhenMultipleRemain() throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    emitter.addListener(EVENT);
    emitter.addListener(EVENT);
    emitter.removeListener(EVENT, false);
    ShadowLooper.idleMainLooper();

    assertEquals(1, listenerCount(emitter, EVENT));
  }

  /** removeListener removes the event key when the last registration is dropped. */
  @Test
  public void removeListener_removesKey_whenLastRegistrationDropped() throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    emitter.addListener(EVENT);
    emitter.removeListener(EVENT, false);
    ShadowLooper.idleMainLooper();

    assertEquals(0, listenerCount(emitter, EVENT));
  }

  /** removeListener(all=true) removes the key even when multiple registrations remain. */
  @Test
  public void removeListener_removesKey_whenAllFlagTrue() throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    emitter.addListener(EVENT);
    emitter.addListener(EVENT);
    emitter.removeListener(EVENT, true);
    ShadowLooper.idleMainLooper();

    assertEquals(0, listenerCount(emitter, EVENT));
  }

  /**
   * Same-context re-attach while the host already names that context clears residual convergence
   * slots (e.g. leftover hostLag) when there is no different pending replacement.
   */
  @Test
  public void attach_clearsConvergence_whenSameContextReattachAndHostCurrent() throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    setWeakRefField(emitter, "hostLagReactContext", staleContext);
    assertEquals(staleContext, hostLagContext(emitter));

    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    assertNull(hostLagContext(emitter));
    assertNull(pendingContext(emitter));
    assertEquals(liveContext, attachedContext(emitter));
  }

  /**
   * Events queued before a matching listener exists are drained by sendQueuedEvents once the
   * listener is registered.
   */
  @Test
  public void sendQueuedEvents_drainsAndEmits_whenListenerRegistersAfterQueue() {
    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();
    emitter.notifyJsReady(true);
    ShadowLooper.idleMainLooper();

    emitter.sendEvent(event(EVENT, eventBody));
    ShadowLooper.idleMainLooper();
    verify(liveJsEmitter, never()).emit(anyString(), eq(eventBody));

    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    verify(liveJsEmitter).emit(eq("rnfb_" + EVENT), eq(eventBody));
  }

  /** Emit aborts immediately when jsReady is still false. */
  @Test
  public void emit_returnsFalse_whenJsReadyFalse() {
    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    emitter.sendEvent(event(EVENT, eventBody));
    ShadowLooper.idleMainLooper();

    verify(liveJsEmitter, never()).emit(anyString(), eq(eventBody));
  }

  /**
   * Emit falls back to the pending context hint when the attached WeakReference has already cleared
   * (dying generation GC'd) while a pending replacement remains.
   */
  @Test
  public void emit_usesPendingHint_whenAttachedWeakReferenceCleared() throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(staleContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    setWeakRefField(emitter, "attachedReactContext", null);

    emitter.sendEvent(event(EVENT, eventBody));
    ShadowLooper.idleMainLooper();

    verify(liveJsEmitter).emit(eq("rnfb_" + EVENT), eq(eventBody));
  }

  /**
   * If jsReady flips false between the unlocked host resolve and the second monitor entry, emit
   * must abort rather than delivering.
   */
  @Test
  public void emit_returnsFalse_whenJsReadyClearedDuringHostResolve() throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();
    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    AtomicBoolean cleared = new AtomicBoolean(false);
    when(reactHost.getCurrentReactContext())
        .thenAnswer(
            invocation -> {
              if (cleared.compareAndSet(false, true)) {
                Field field = ReactNativeFirebaseEventEmitter.class.getDeclaredField("jsReady");
                field.setAccessible(true);
                field.setBoolean(emitter, false);
              }
              return liveContext;
            });

    emitter.sendEvent(event(EVENT, eventBody));
    ShadowLooper.idleMainLooper();

    verify(liveJsEmitter, never()).emit(anyString(), eq(eventBody));
  }

  /** Emit refuses delivery when the resolved context reports no active React instance. */
  @Test
  public void emit_returnsFalse_whenResolvedContextHasNoActiveInstance() {
    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);
    when(liveContext.hasActiveReactInstance()).thenReturn(false);

    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();
    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    emitter.sendEvent(event(EVENT, eventBody));
    ShadowLooper.idleMainLooper();

    verify(liveJsEmitter, never()).emit(anyString(), eq(eventBody));
  }

  /** Emit catches DeviceEventEmitter failures and returns false rather than propagating. */
  @Test
  public void emit_returnsFalse_whenDeviceEventEmitterThrows() {
    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);
    doThrow(new RuntimeException("emit failed"))
        .when(liveJsEmitter)
        .emit(anyString(), eq(eventBody));

    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();
    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    emitter.sendEvent(event(EVENT, eventBody));
    ShadowLooper.idleMainLooper();

    verify(liveJsEmitter).emit(eq("rnfb_" + EVENT), eq(eventBody));
  }

  /**
   * While a pending replacement owns listeners, an unrelated third host current must not receive
   * events (that runtime has no RNFB JS subscribers). Emit prefers pending so delivery is not
   * silently lost without re-queue.
   */
  @Test
  public void emit_deliversToPending_whenHostMovedToUnrelatedThirdContext() throws Exception {
    ReactContext thirdContext = mock(ReactContext.class);
    DeviceEventManagerModule.RCTDeviceEventEmitter thirdJsEmitter =
        mock(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
    when(thirdContext.getApplicationContext()).thenReturn(application);
    when(thirdContext.hasActiveReactInstance()).thenReturn(true);
    when(thirdContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class))
        .thenReturn(thirdJsEmitter);

    when(reactHost.getCurrentReactContext()).thenReturn(staleContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    when(reactHost.getCurrentReactContext()).thenReturn(thirdContext);
    emitter.sendEvent(event(EVENT, eventBody));
    ShadowLooper.idleMainLooper();

    verify(liveJsEmitter).emit(eq("rnfb_" + EVENT), eq(eventBody));
    verify(thirdJsEmitter, never()).emit(anyString(), eq(eventBody));
    verify(staleJsEmitter, never()).emit(anyString(), eq(eventBody));
  }

  /**
   * After pending-only cancel following a host advance to an unrelated third context, restored
   * listeners belong to the surviving attached generation. Emit must not prefer that unattached
   * hostCurrent (silent delivery into a runtime with no RNFB JS subscribers).
   */
  @Test
  public void emit_deliversToRestoredAttached_afterPendingCancelWhenHostOnUnrelatedThird()
      throws Exception {
    ReactContext thirdContext = mock(ReactContext.class);
    DeviceEventManagerModule.RCTDeviceEventEmitter thirdJsEmitter =
        mock(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
    when(thirdContext.getApplicationContext()).thenReturn(application);
    when(thirdContext.hasActiveReactInstance()).thenReturn(true);
    when(thirdContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class))
        .thenReturn(thirdJsEmitter);

    when(reactHost.getCurrentReactContext()).thenReturn(staleContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();

    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();
    assertEquals(liveContext, pendingContext(emitter));

    when(reactHost.getCurrentReactContext()).thenReturn(thirdContext);
    emitter.detachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    assertEquals(null, pendingContext(emitter));
    assertEquals(staleContext, attachedContext(emitter));
    assertEquals(1, listenerCount(emitter, EVENT));
    assertTrue(jsReady(emitter));

    emitter.sendEvent(event(EVENT, eventBody));
    ShadowLooper.idleMainLooper();

    verify(staleJsEmitter).emit(eq("rnfb_" + EVENT), eq(eventBody));
    verify(thirdJsEmitter, never()).emit(anyString(), eq(eventBody));
    verify(liveJsEmitter, never()).emit(anyString(), eq(eventBody));
  }

  /**
   * A subsequent acceptAttachedContext of the host's live generation clears restored-attached emit
   * affinity so delivery follows the new attached runtime.
   */
  @Test
  public void emit_prefersNewlyAttachedHost_afterRestoredAffinityClearedByAccept()
      throws Exception {
    ReactContext thirdContext = mock(ReactContext.class);
    DeviceEventManagerModule.RCTDeviceEventEmitter thirdJsEmitter =
        mock(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
    when(thirdContext.getApplicationContext()).thenReturn(application);
    when(thirdContext.hasActiveReactInstance()).thenReturn(true);
    when(thirdContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class))
        .thenReturn(thirdJsEmitter);

    when(reactHost.getCurrentReactContext()).thenReturn(staleContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();

    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    when(reactHost.getCurrentReactContext()).thenReturn(thirdContext);
    emitter.detachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    // Host generation attaches for real — affinity must clear.
    emitter.attachReactContext(thirdContext);
    ShadowLooper.idleMainLooper();
    assertEquals(thirdContext, attachedContext(emitter));

    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    emitter.sendEvent(event(EVENT, eventBody));
    ShadowLooper.idleMainLooper();

    verify(thirdJsEmitter).emit(eq("rnfb_" + EVENT), eq(eventBody));
    verify(staleJsEmitter, never()).emit(anyString(), eq(eventBody));
  }

  /**
   * With no pending slot and a null host current, emit delivers into the still-attached context.
   */
  @Test
  public void emit_deliversToAttached_whenHostCurrentNullAndNoPending() {
    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();
    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    when(reactHost.getCurrentReactContext()).thenReturn(null);
    emitter.sendEvent(event(EVENT, eventBody));
    ShadowLooper.idleMainLooper();

    verify(liveJsEmitter).emit(eq("rnfb_" + EVENT), eq(eventBody));
  }

  /**
   * A posted tryConverge that runs after the pending slot was cancelled is a no-op (pendingHint
   * null).
   */
  @Test
  public void tryConverge_noOps_whenPendingCancelledBeforePostedRunnableRuns() throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(staleContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();

    // Enters pending and posts tryConverge; do not idle yet.
    emitter.attachReactContext(liveContext);
    assertEquals(liveContext, pendingContext(emitter));

    // Cancel pending before the posted converge runs.
    emitter.detachReactContext(liveContext);
    assertNull(pendingContext(emitter));

    ShadowLooper.idleMainLooper();
    assertEquals(staleContext, attachedContext(emitter));
  }

  /**
   * Host catch-up between posting tryConverge and running it promotes pending without a second
   * attach call.
   */
  @Test
  public void tryConverge_promotesPending_whenHostCatchesUpBeforePostedRunnable() throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(staleContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();

    emitter.attachReactContext(liveContext);
    assertEquals(liveContext, pendingContext(emitter));
    assertEquals(staleContext, attachedContext(emitter));

    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);
    ShadowLooper.idleMainLooper();

    assertEquals(liveContext, attachedContext(emitter));
    assertNull(pendingContext(emitter));
    assertNull(hostLagContext(emitter));
  }

  /**
   * When attached already equals pending at converge time, clear convergence state without
   * re-accepting attachment.
   */
  @Test
  public void tryConverge_clearsStateOnly_whenAttachedAlreadyEqualsPending() throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    setWeakRefField(emitter, "pendingReactContext", liveContext);
    setWeakRefField(emitter, "hostLagReactContext", staleContext);

    Method converge =
        ReactNativeFirebaseEventEmitter.class.getDeclaredMethod(
            "tryConvergePendingReactContextLocked", ReactContext.class);
    converge.setAccessible(true);
    boolean changed = (boolean) converge.invoke(emitter, liveContext);

    assertFalse(changed);
    assertNull(pendingContext(emitter));
    assertNull(hostLagContext(emitter));
    assertEquals(liveContext, attachedContext(emitter));
  }

  /** Brownfield hosts that are not {@link ReactApplication} resolve host current as null. */
  @Test
  public void hostResolution_returnsNull_whenApplicationContextIsNotReactApplication()
      throws Exception {
    Application plainApp = mock(Application.class);
    when(plainApp.getApplicationContext()).thenReturn(plainApp);
    ReactContext brownfieldContext = mock(ReactContext.class);
    when(brownfieldContext.getApplicationContext()).thenReturn(plainApp);

    Method resolve =
        ReactNativeFirebaseEventEmitter.class.getDeclaredMethod(
            "getCurrentReactContextFromHost", ReactContext.class);
    resolve.setAccessible(true);
    assertNull(resolve.invoke(null, brownfieldContext));
  }

  /** ReactHost getter failures are swallowed; resolution may still fall through. */
  @Test
  public void hostResolution_swallowsReactHostRuntimeException() throws Exception {
    Application reactApp =
        mock(
            Application.class,
            org.mockito.Mockito.withSettings().extraInterfaces(ReactApplication.class));
    ReactApplication asReactApplication = (ReactApplication) reactApp;
    when(reactApp.getApplicationContext()).thenReturn(reactApp);
    when(asReactApplication.getReactHost()).thenThrow(new RuntimeException("reactHost broken"));
    when(asReactApplication.getReactNativeHost())
        .thenThrow(new RuntimeException("bridgeless-only test host"));

    ReactContext hint = mock(ReactContext.class);
    when(hint.getApplicationContext()).thenReturn(reactApp);

    Method resolve =
        ReactNativeFirebaseEventEmitter.class.getDeclaredMethod(
            "getCurrentReactContextFromHost", ReactContext.class);
    resolve.setAccessible(true);
    assertNull(resolve.invoke(null, hint));
  }

  /** When ReactHost is absent, ReactNativeHost failures are logged and null current is returned. */
  @Test
  public void hostResolution_swallowsReactNativeHostFailure_whenReactHostAbsent() throws Exception {
    application.reactHost = null;
    ReactNativeHost rnHost = mock(ReactNativeHost.class);
    application.reactNativeHost = rnHost;
    when(rnHost.hasInstance()).thenThrow(new RuntimeException("native host broken"));

    Method resolve =
        ReactNativeFirebaseEventEmitter.class.getDeclaredMethod(
            "getCurrentReactContextFromHost", ReactContext.class);
    resolve.setAccessible(true);
    assertNull(resolve.invoke(null, liveContext));
  }

  /**
   * When ReactHost is present but reports a null current and ReactNativeHost has no instance,
   * resolution returns the null ReactHost current (hybrid fallthrough with nothing on the bridge).
   */
  @Test
  public void hostResolution_returnsNullFromReactHost_whenNativeHostHasNoInstance()
      throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(null);
    ReactNativeHost rnHost = mock(ReactNativeHost.class);
    application.reactNativeHost = rnHost;
    when(rnHost.hasInstance()).thenReturn(false);

    Method resolve =
        ReactNativeFirebaseEventEmitter.class.getDeclaredMethod(
            "getCurrentReactContextFromHost", ReactContext.class);
    resolve.setAccessible(true);
    assertNull(resolve.invoke(null, liveContext));
  }

  /**
   * When ReactHost is present but reports a null current, a subsequent ReactNativeHost failure must
   * still return the null ReactHost current.
   */
  @Test
  public void hostResolution_returnsNullFromReactHost_whenNativeHostFailsAfterNullCurrent()
      throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(null);
    ReactNativeHost rnHost = mock(ReactNativeHost.class);
    application.reactNativeHost = rnHost;
    when(rnHost.hasInstance()).thenThrow(new RuntimeException("native host broken"));

    Method resolve =
        ReactNativeFirebaseEventEmitter.class.getDeclaredMethod(
            "getCurrentReactContextFromHost", ReactContext.class);
    resolve.setAccessible(true);
    assertNull(resolve.invoke(null, liveContext));
  }

  /**
   * Fallback {@link ReactNativeFirebaseApp#getApplicationContext()} path when the context hint is
   * null still participates in host resolution (and brownfield null when unset).
   */
  @Test
  public void hostResolution_usesReactNativeFirebaseAppFallback_whenContextHintNull()
      throws Exception {
    Context previous = ReactNativeFirebaseApp.getApplicationContext();
    try {
      ReactNativeFirebaseApp.setApplicationContext(null);
      Method resolve =
          ReactNativeFirebaseEventEmitter.class.getDeclaredMethod(
              "getCurrentReactContextFromHost", ReactContext.class);
      resolve.setAccessible(true);
      assertNull(resolve.invoke(null, new Object[] {null}));
    } finally {
      ReactNativeFirebaseApp.setApplicationContext(previous);
    }
  }

  /**
   * Same-context re-attach while the host names a different generation must not clear convergence
   * (dying hostLag with a different pending must keep waiting).
   */
  @Test
  public void attach_doesNotClearConvergence_whenSameContextReattachAndHostCurrentDiffers()
      throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(staleContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    assertEquals(liveContext, pendingContext(emitter));
    assertEquals(staleContext, hostLagContext(emitter));

    // Host moved onto live, but re-attach of dying stale must not clear pending.
    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();

    assertEquals(liveContext, pendingContext(emitter));
    assertEquals(staleContext, attachedContext(emitter));
    assertEquals(staleContext, hostLagContext(emitter));
  }

  /**
   * Same-context re-attach of the pending identity while the host has caught up clears residual
   * convergence (pending == reactContext arm of the compound guard).
   */
  @Test
  public void attach_clearsConvergence_whenSamePendingReattachAndHostCurrent() throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(staleContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    // Promote pending to attached while leaving pending slot set (host catch-up path normally
    // clears; force the same-context re-attach compound pending == reactContext).
    setWeakRefField(emitter, "attachedReactContext", liveContext);
    setWeakRefField(emitter, "pendingReactContext", liveContext);
    setWeakRefField(emitter, "hostLagReactContext", staleContext);
    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);

    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    assertNull(pendingContext(emitter));
    assertNull(hostLagContext(emitter));
    assertEquals(liveContext, attachedContext(emitter));
  }

  /** removeListener is a no-op when the event was never registered. */
  @Test
  public void removeListener_isNoOp_whenEventNeverRegistered() throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    emitter.removeListener(EVENT, false);
    ShadowLooper.idleMainLooper();

    assertEquals(0, listenerCount(emitter, EVENT));
  }

  /**
   * sendQueuedEvents leaves queued events whose names have no current listener (does not remove
   * them while draining matching ones).
   */
  @Test
  public void sendQueuedEvents_leavesUnmatchedQueuedEvents() throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();
    emitter.notifyJsReady(true);
    ShadowLooper.idleMainLooper();

    WritableMap otherBody = mock(WritableMap.class);
    emitter.sendEvent(event(EVENT, eventBody));
    emitter.sendEvent(event("auth_id_token_changed", otherBody));
    ShadowLooper.idleMainLooper();

    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    verify(liveJsEmitter).emit(eq("rnfb_" + EVENT), eq(eventBody));
    verify(liveJsEmitter, never()).emit(eq("rnfb_auth_id_token_changed"), eq(otherBody));

    Field queued = ReactNativeFirebaseEventEmitter.class.getDeclaredField("queuedEvents");
    queued.setAccessible(true);
    @SuppressWarnings("unchecked")
    java.util.List<NativeEvent> remaining = (java.util.List<NativeEvent>) queued.get(emitter);
    assertEquals(1, remaining.size());
    assertEquals("auth_id_token_changed", remaining.get(0).getEventName());
  }

  /**
   * Emit returns false (and re-queues) when resolveEmitContext yields null — no attached, no
   * pending, and a null host current.
   */
  @Test
  public void emit_returnsFalse_whenEmitContextNull() throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(null);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    emitter.sendEvent(event(EVENT, eventBody));
    ShadowLooper.idleMainLooper();

    verify(liveJsEmitter, never()).emit(anyString(), eq(eventBody));
    verify(staleJsEmitter, never()).emit(anyString(), eq(eventBody));

    Field queued = ReactNativeFirebaseEventEmitter.class.getDeclaredField("queuedEvents");
    queued.setAccessible(true);
    @SuppressWarnings("unchecked")
    java.util.List<NativeEvent> remaining = (java.util.List<NativeEvent>) queued.get(emitter);
    assertEquals(1, remaining.size());
  }

  /** With no pending and a null attached pointer, emit prefers the non-null host current. */
  @Test
  public void emit_deliversToHostCurrent_whenAttachedNullAndNoPending() throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();
    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    // Clear attached after host can still resolve via FirebaseApp fallback + ReactHost.
    Context previous = ReactNativeFirebaseApp.getApplicationContext();
    try {
      ReactNativeFirebaseApp.setApplicationContext(application);
      setWeakRefField(emitter, "attachedReactContext", null);
      setWeakRefField(emitter, "pendingReactContext", null);

      emitter.sendEvent(event(EVENT, eventBody));
      ShadowLooper.idleMainLooper();

      verify(liveJsEmitter).emit(eq("rnfb_" + EVENT), eq(eventBody));
    } finally {
      ReactNativeFirebaseApp.setApplicationContext(previous);
    }
  }

  /**
   * With no pending, a lagging host current that matches hostLag prefers the live attached
   * generation over that dying host ref.
   */
  @Test
  public void emit_prefersAttached_whenHostLagMatchesHostCurrentAndNoPending() throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();
    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    setWeakRefField(emitter, "hostLagReactContext", staleContext);
    when(reactHost.getCurrentReactContext()).thenReturn(staleContext);

    emitter.sendEvent(event(EVENT, eventBody));
    ShadowLooper.idleMainLooper();

    verify(liveJsEmitter).emit(eq("rnfb_" + EVENT), eq(eventBody));
    verify(staleJsEmitter, never()).emit(anyString(), eq(eventBody));
  }

  /**
   * Pending-only cancel with a cleared snapshot falls back to resetListenerState (defensive path if
   * snapshot accounting was discarded while pending still lived).
   */
  @Test
  public void detach_resetsListeners_whenPendingOnlyCancelledWithoutSnapshot() throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(staleContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    Field snapshot =
        ReactNativeFirebaseEventEmitter.class.getDeclaredField("attachedListenersSnapshot");
    snapshot.setAccessible(true);
    snapshot.set(emitter, null);

    emitter.detachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    assertNull(pendingContext(emitter));
    assertEquals(staleContext, attachedContext(emitter));
    assertEquals(0, listenerCount(emitter, EVENT));
    assertFalse(jsReady(emitter));
  }

  /**
   * Last-writer-wins pending replace reuses the first attached snapshot so a later pending-only
   * cancel still restores the original attached generation.
   */
  @Test
  public void detach_restoresOriginalAttachedSnapshot_afterLastWriterWinsPendingReplace()
      throws Exception {
    ReactContext middlePending = mock(ReactContext.class);
    when(middlePending.getApplicationContext()).thenReturn(application);
    when(middlePending.hasActiveReactInstance()).thenReturn(true);

    when(reactHost.getCurrentReactContext()).thenReturn(staleContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();

    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    emitter.attachReactContext(middlePending);
    ShadowLooper.idleMainLooper();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    assertEquals(liveContext, pendingContext(emitter));
    assertEquals(0, listenerCount(emitter, EVENT));

    emitter.detachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    assertEquals(staleContext, attachedContext(emitter));
    assertEquals(1, listenerCount(emitter, EVENT));
    assertTrue(jsReady(emitter));
  }

  /** Detach of attached when pending identity equals attached clears attachment (no promote). */
  @Test
  public void detach_clearsAttached_whenPendingIdentityEqualsAttached() throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();
    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    setWeakRefField(emitter, "pendingReactContext", liveContext);

    emitter.detachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    assertNull(attachedContext(emitter));
    assertNull(pendingContext(emitter));
    assertEquals(0, listenerCount(emitter, EVENT));
  }

  /**
   * getListenersMap prefers the pending context as the host-resolution hint while a pending
   * candidate exists.
   */
  @Test
  public void getListenersMap_usesPendingHint_whenPendingExists() throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(staleContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();

    assertEquals(liveContext, pendingContext(emitter));

    WritableMap writableMap = mock(WritableMap.class);
    WritableMap eventsMap = mock(WritableMap.class);
    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      arguments.when(Arguments::createMap).thenReturn(writableMap, eventsMap);
      emitter.getListenersMap();
      verify(writableMap).putInt("attachedContextHash", System.identityHashCode(staleContext));
      // Host still names dying attached; current hash follows host, not pending hint alone.
      verify(writableMap).putInt("currentContextHash", System.identityHashCode(staleContext));
    }
  }

  /**
   * With no pending, a non-null hostLag that does not match host current does not divert emit away
   * from the host-preferred path (hostLag != hostCurrent arm).
   */
  @Test
  public void emit_prefersHostCurrent_whenHostLagSetButDoesNotMatchHost() throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(staleContext);
    ShadowLooper.idleMainLooper();
    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    setWeakRefField(emitter, "hostLagReactContext", staleContext);
    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);

    emitter.sendEvent(event(EVENT, eventBody));
    ShadowLooper.idleMainLooper();

    verify(liveJsEmitter).emit(eq("rnfb_" + EVENT), eq(eventBody));
    verify(staleJsEmitter, never()).emit(anyString(), eq(eventBody));
  }

  /**
   * Hybrid fallthrough: ReactHost reports null current and getReactNativeHost returns null — the
   * null ReactHost current stands.
   */
  @Test
  public void hostResolution_returnsNull_whenReactNativeHostNullAfterNullReactHostCurrent()
      throws Exception {
    Application reactApp =
        mock(
            Application.class,
            org.mockito.Mockito.withSettings().extraInterfaces(ReactApplication.class));
    ReactApplication asReactApplication = (ReactApplication) reactApp;
    when(reactApp.getApplicationContext()).thenReturn(reactApp);
    ReactHost host = mock(ReactHost.class);
    when(asReactApplication.getReactHost()).thenReturn(host);
    when(host.getCurrentReactContext()).thenReturn(null);
    when(asReactApplication.getReactNativeHost()).thenReturn(null);

    ReactContext hint = mock(ReactContext.class);
    when(hint.getApplicationContext()).thenReturn(reactApp);

    Method resolve =
        ReactNativeFirebaseEventEmitter.class.getDeclaredMethod(
            "getCurrentReactContextFromHost", ReactContext.class);
    resolve.setAccessible(true);
    assertNull(resolve.invoke(null, hint));
  }

  /**
   * acceptAttachedContext is a no-op when the candidate is already the attached identity (guards
   * the inner identity check; production callers only invoke it on a change).
   */
  @Test
  public void acceptAttachedContext_noOps_whenCandidateAlreadyAttached() throws Exception {
    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);
    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();
    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    Method accept =
        ReactNativeFirebaseEventEmitter.class.getDeclaredMethod(
            "acceptAttachedContext", ReactContext.class, boolean.class);
    accept.setAccessible(true);
    accept.invoke(emitter, liveContext, true);

    assertEquals(liveContext, attachedContext(emitter));
    assertEquals(1, listenerCount(emitter, EVENT));
    assertTrue(jsReady(emitter));
  }

  /**
   * Diagnostic map exposes jsReady and context identity hashes used for on-device diagnosis. {@link
   * Arguments#createMap()} is mocked so the JVM test does not need native SoLoader.
   */
  @Test
  public void getListenersMap_exposesJsReadyAndContextIdentityHashes() {
    when(reactHost.getCurrentReactContext()).thenReturn(liveContext);

    ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
    emitter.attachReactContext(liveContext);
    ShadowLooper.idleMainLooper();
    emitter.notifyJsReady(true);
    emitter.addListener(EVENT);
    ShadowLooper.idleMainLooper();

    WritableMap writableMap = mock(WritableMap.class);
    WritableMap eventsMap = mock(WritableMap.class);

    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      arguments.when(Arguments::createMap).thenReturn(writableMap, eventsMap);

      WritableMap result = emitter.getListenersMap();
      assertEquals(writableMap, result);

      verify(writableMap).putInt("listeners", 1);
      verify(writableMap).putInt(eq("queued"), eq(0));
      verify(writableMap).putBoolean("jsReady", true);
      verify(writableMap).putInt("attachedContextHash", System.identityHashCode(liveContext));
      verify(writableMap).putInt("currentContextHash", System.identityHashCode(liveContext));
      verify(eventsMap).putInt(EVENT, 1);
      verify(writableMap).putMap("events", eventsMap);
    }
  }

  private static NativeEvent event(String name, WritableMap body) {
    return new NativeEvent() {
      @Override
      public String getEventName() {
        return name;
      }

      @Override
      public WritableMap getEventBody() {
        return body;
      }

      @Override
      public String getFirebaseAppName() {
        return "[DEFAULT]";
      }
    };
  }

  private static void resetSharedInstance() throws Exception {
    Constructor<ReactNativeFirebaseEventEmitter> ctor =
        ReactNativeFirebaseEventEmitter.class.getDeclaredConstructor();
    ctor.setAccessible(true);
    ReactNativeFirebaseEventEmitter fresh = ctor.newInstance();

    Field shared = ReactNativeFirebaseEventEmitter.class.getDeclaredField("sharedInstance");
    shared.setAccessible(true);
    shared.set(null, fresh);
  }

  @SuppressWarnings("unchecked")
  private static int listenerCount(ReactNativeFirebaseEventEmitter emitter, String eventName)
      throws Exception {
    Field field = ReactNativeFirebaseEventEmitter.class.getDeclaredField("jsListeners");
    field.setAccessible(true);
    HashMap<String, Integer> listeners = (HashMap<String, Integer>) field.get(emitter);
    Integer count = listeners.get(eventName);
    return count == null ? 0 : count;
  }

  @SuppressWarnings("unchecked")
  private static int queuedCount(ReactNativeFirebaseEventEmitter emitter) throws Exception {
    Field field = ReactNativeFirebaseEventEmitter.class.getDeclaredField("queuedEvents");
    field.setAccessible(true);
    return ((java.util.List<NativeEvent>) field.get(emitter)).size();
  }

  private static boolean jsReady(ReactNativeFirebaseEventEmitter emitter) throws Exception {
    Field field = ReactNativeFirebaseEventEmitter.class.getDeclaredField("jsReady");
    field.setAccessible(true);
    return field.getBoolean(emitter);
  }

  @SuppressWarnings("unchecked")
  private static ReactContext attachedContext(ReactNativeFirebaseEventEmitter emitter)
      throws Exception {
    Field field = ReactNativeFirebaseEventEmitter.class.getDeclaredField("attachedReactContext");
    field.setAccessible(true);
    WeakReference<ReactContext> ref = (WeakReference<ReactContext>) field.get(emitter);
    return ref.get();
  }

  @SuppressWarnings("unchecked")
  private static ReactContext pendingContext(ReactNativeFirebaseEventEmitter emitter)
      throws Exception {
    Field field = ReactNativeFirebaseEventEmitter.class.getDeclaredField("pendingReactContext");
    field.setAccessible(true);
    WeakReference<ReactContext> ref = (WeakReference<ReactContext>) field.get(emitter);
    return ref.get();
  }

  @SuppressWarnings("unchecked")
  private static ReactContext hostLagContext(ReactNativeFirebaseEventEmitter emitter)
      throws Exception {
    Field field = ReactNativeFirebaseEventEmitter.class.getDeclaredField("hostLagReactContext");
    field.setAccessible(true);
    WeakReference<ReactContext> ref = (WeakReference<ReactContext>) field.get(emitter);
    return ref.get();
  }

  private static void setWeakRefField(
      ReactNativeFirebaseEventEmitter emitter, String fieldName, @Nullable ReactContext value)
      throws Exception {
    Field field = ReactNativeFirebaseEventEmitter.class.getDeclaredField(fieldName);
    field.setAccessible(true);
    field.set(emitter, new WeakReference<>(value));
  }

  /**
   * Asserts the same diagnostic identities {@link
   * ReactNativeFirebaseEventEmitter#getListenersMap()} exposes (jsReady / attached / host current
   * hashes) without calling {@code Arguments.createMap()}, which requires native SoLoader.
   */
  private static void assertDiagnostics(
      ReactNativeFirebaseEventEmitter emitter,
      boolean expectedJsReady,
      @Nullable ReactContext expectedAttached,
      @Nullable ReactContext expectedCurrent)
      throws Exception {
    assertEquals(expectedJsReady, jsReady(emitter));
    assertEquals(expectedAttached, attachedContext(emitter));

    Method resolve =
        ReactNativeFirebaseEventEmitter.class.getDeclaredMethod(
            "getCurrentReactContextFromHost", ReactContext.class);
    resolve.setAccessible(true);
    ReactContext current = (ReactContext) resolve.invoke(null, expectedAttached);
    assertEquals(expectedCurrent, current);
  }
}
