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
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertThrows;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.same;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import android.app.Service;
import android.content.Intent;
import android.os.PowerManager;
import com.facebook.react.ReactHost;
import com.facebook.react.ReactInstanceEventListener;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.internal.featureflags.ReactNativeNewArchitectureFeatureFlags;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;
import com.facebook.react.jstasks.HeadlessJsTaskContext;
import com.facebook.react.modules.appregistry.AppRegistry;
import com.google.firebase.messaging.RemoteMessage;
import io.invertase.firebase.common.ReactNativeFirebaseJSON;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.MockedStatic;
import org.robolectric.Robolectric;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.android.controller.ServiceController;
import org.robolectric.shadow.api.Shadow;
import org.robolectric.shadows.ShadowLog;
import org.robolectric.shadows.ShadowLooper;
import org.robolectric.shadows.ShadowPowerManager;
import org.robolectric.shadows.ShadowService;

/**
 * JVM coverage for {@link ReactNativeFirebaseMessagingHeadlessService} cold-start scheduling: a
 * task must not reach {@link HeadlessJsTaskContext} until the React instance is active.
 *
 * <p>The real {@link HeadlessJsTaskContext} runs against a mocked {@link ReactContext}; JS delivery
 * is observed as {@link AppRegistry#startHeadlessTask}. Robolectric provides the {@code Service}
 * lifecycle, main looper and {@code PowerManager} wake lock; Mockito replaces the React hosts and
 * the native-backed architecture feature flag.
 */
@RunWith(RobolectricTestRunner.class)
public class ReactNativeFirebaseMessagingHeadlessServiceTest {

  private static final String TASK_KEY = "ReactNativeFirebaseMessagingHeadlessTask";
  private static final long TIMEOUT_MS = 5000;

  public static class TestService extends ReactNativeFirebaseMessagingHeadlessService {
    ReactHost host;
    ReactNativeHost nativeHost;
    final Map<Integer, WritableMap> data = new HashMap<>();

    @Override
    protected HeadlessJsTaskConfig getTaskConfig(Intent intent) {
      if (intent.getExtras() == null || intent.hasExtra("message")) {
        return super.getTaskConfig(intent);
      }
      WritableMap body = mock(WritableMap.class);
      when(body.copy()).thenReturn(body);
      data.put(intent.getIntExtra("n", 0), body);
      return new HeadlessJsTaskConfig(
          TASK_KEY, body, intent.getLongExtra("timeout", TIMEOUT_MS), true);
    }

    @Override
    protected ReactHost getReactHost() {
      return host;
    }

    @Override
    protected ReactNativeHost getReactNativeHost() {
      return nativeHost;
    }
  }

  private MockedStatic<ReactNativeNewArchitectureFeatureFlags> featureFlags;
  private ReactHost reactHost;
  private ReactContext reactContext;
  private AppRegistry appRegistry;
  private ServiceController<TestService> controller;
  private TestService service;
  private boolean destroyed;

  @Before
  public void setUp() {
    featureFlags = mockStatic(ReactNativeNewArchitectureFeatureFlags.class);
    featureFlags
        .when(ReactNativeNewArchitectureFeatureFlags::enableBridgelessArchitecture)
        .thenReturn(true);

    appRegistry = mock(AppRegistry.class);
    reactContext = mock(ReactContext.class);
    when(reactContext.getJSModule(AppRegistry.class)).thenReturn(appRegistry);
    doAnswer(
            invocation -> {
              ((Runnable) invocation.getArgument(0)).run();
              return true;
            })
        .when(reactContext)
        .runOnJSQueueThread(any());

    reactHost = mock(ReactHost.class);

    controller = Robolectric.buildService(TestService.class);
    service = controller.create().get();
    service.host = reactHost;
  }

  @After
  public void tearDown() {
    try {
      if (!destroyed) {
        controller.destroy();
      }
    } finally {
      featureFlags.close();
    }
  }

  private int start(int n) {
    return service.onStartCommand(new Intent().putExtra("n", n), 0, n);
  }

  private int start(int n, long timeout) {
    return service.onStartCommand(new Intent().putExtra("n", n).putExtra("timeout", timeout), 0, n);
  }

  private static void idle() {
    ShadowLooper.idleMainLooper();
  }

  private static void idleFor(long ms) {
    ShadowLooper.idleMainLooper(ms, TimeUnit.MILLISECONDS);
  }

  private HeadlessJsTaskContext headlessContext() {
    return HeadlessJsTaskContext.getInstance(reactContext);
  }

  private void verifyDelivered(int n) {
    verify(appRegistry).startHeadlessTask(anyInt(), eq(TASK_KEY), same(service.data.get(n)));
  }

  private void verifyNothingStarted() {
    verify(appRegistry, never()).startHeadlessTask(anyInt(), any(), any());
    assertFalse(headlessContext().hasActiveTasks());
  }

  private ReactInstanceEventListener capturedHostListener() {
    ArgumentCaptor<ReactInstanceEventListener> captor =
        ArgumentCaptor.forClass(ReactInstanceEventListener.class);
    verify(reactHost).addReactInstanceEventListener(captor.capture());
    return captor.getValue();
  }

  private void becomeReady(ReactInstanceEventListener listener) {
    when(reactContext.hasActiveReactInstance()).thenReturn(true);
    when(reactHost.getCurrentReactContext()).thenReturn(reactContext);
    listener.onReactContextInitialized(reactContext);
    idle();
  }

  private ShadowService shadowService() {
    return Shadow.extract(service);
  }

  private boolean stoppedBySelf() {
    return shadowService().isStoppedBySelf();
  }

  private void destroy() {
    controller.destroy();
    destroyed = true;
  }

  @Test
  public void noContext_startsReactAndStartsTaskOnceInitialized() {
    assertEquals(Service.START_REDELIVER_INTENT, start(1));
    idle();

    ReactInstanceEventListener listener = capturedHostListener();
    verify(reactHost).start();
    verifyNothingStarted();

    becomeReady(listener);

    verifyDelivered(1);
    verify(reactHost).removeReactInstanceEventListener(listener);
  }

  @Test
  public void contextWithoutActiveInstance_waitsForInitializationBeforeStarting() {
    when(reactHost.getCurrentReactContext()).thenReturn(reactContext);
    when(reactContext.hasActiveReactInstance()).thenReturn(false);

    start(1);
    idle();

    verifyNothingStarted();
    ReactInstanceEventListener listener = capturedHostListener();
    verify(reactHost, never()).start();

    becomeReady(listener);

    verifyDelivered(1);
    verify(reactHost).removeReactInstanceEventListener(listener);
  }

  @Test
  public void activeInstance_startsTaskImmediately() {
    when(reactHost.getCurrentReactContext()).thenReturn(reactContext);
    when(reactContext.hasActiveReactInstance()).thenReturn(true);

    start(1);
    idle();

    verifyDelivered(1);
    verify(reactHost, never()).addReactInstanceEventListener(any());
    verify(reactHost, never()).start();
  }

  @Test
  public void queuedTasks_startInArrivalOrderWithOneListener() {
    when(reactHost.getCurrentReactContext()).thenReturn(reactContext);

    start(1);
    start(2);
    start(3);
    idle();

    ReactInstanceEventListener listener = capturedHostListener();
    verifyNothingStarted();

    becomeReady(listener);
    start(4);
    idle();

    InOrder order = inOrder(appRegistry);
    for (int n = 1; n <= 4; n++) {
      order
          .verify(appRegistry)
          .startHeadlessTask(anyInt(), eq(TASK_KEY), same(service.data.get(n)));
    }
  }

  @Test
  public void initializedWithoutActiveInstance_keepsWaiting() {
    when(reactHost.getCurrentReactContext()).thenReturn(reactContext);
    start(1);
    ArgumentCaptor<ReactInstanceEventListener> captor =
        ArgumentCaptor.forClass(ReactInstanceEventListener.class);
    verify(reactHost).addReactInstanceEventListener(captor.capture());
    ReactInstanceEventListener first = captor.getValue();

    first.onReactContextInitialized(reactContext);
    idle();

    verify(reactHost).removeReactInstanceEventListener(first);
    verify(reactHost, times(2)).addReactInstanceEventListener(captor.capture());
    ReactInstanceEventListener second = captor.getValue();
    verifyNothingStarted();

    becomeReady(second);

    verifyDelivered(1);
  }

  @Test
  public void neverReady_timesOutStopsServiceReleasesWakeLockAndRemovesListener() {
    when(reactHost.getCurrentReactContext()).thenReturn(reactContext);
    start(1);
    start(2);
    ReactInstanceEventListener listener = capturedHostListener();
    PowerManager.WakeLock wakeLock = ShadowPowerManager.getLatestWakeLock();
    assertTrue(wakeLock.isHeld());

    idleFor(TIMEOUT_MS - 1);
    assertFalse(stoppedBySelf());

    idleFor(1);
    assertTrue(stoppedBySelf());
    assertEquals(2, shadowService().getStopSelfResultId());
    verify(reactHost).removeReactInstanceEventListener(listener);

    becomeReady(listener);
    verifyNothingStarted();

    destroy();
    assertFalse(wakeLock.isHeld());
  }

  @Test
  public void timeoutWithRunningTask_stopsOnlyWhenThatTaskFinishes() {
    when(reactHost.getCurrentReactContext()).thenReturn(reactContext);
    when(reactContext.hasActiveReactInstance()).thenReturn(true);
    start(1, 4 * TIMEOUT_MS);
    idle();
    when(reactContext.hasActiveReactInstance()).thenReturn(false);
    start(2, TIMEOUT_MS);

    idleFor(TIMEOUT_MS);
    assertFalse(stoppedBySelf());
    verify(reactHost).removeReactInstanceEventListener(any());

    ArgumentCaptor<Integer> taskId = ArgumentCaptor.forClass(Integer.class);
    verify(appRegistry).startHeadlessTask(taskId.capture(), eq(TASK_KEY), any());
    headlessContext().finishTask(taskId.getValue());
    idle();
    assertTrue(stoppedBySelf());
  }

  @Test
  public void nonPositiveTimeout_waitsWithoutDeadline() {
    when(reactHost.getCurrentReactContext()).thenReturn(reactContext);
    start(1, 0);
    ReactInstanceEventListener listener = capturedHostListener();

    idleFor(10 * TIMEOUT_MS);
    assertFalse(stoppedBySelf());
    verify(reactHost, never()).removeReactInstanceEventListener(any());

    becomeReady(listener);
    verifyDelivered(1);
  }

  @Test
  public void destroyWhileWaiting_removesListenerAndCancelsTimeout() {
    start(1);
    ReactInstanceEventListener listener = capturedHostListener();

    destroy();

    verify(reactHost).removeReactInstanceEventListener(listener);
    idleFor(TIMEOUT_MS);
    assertFalse(stoppedBySelf());
  }

  @Test
  public void taskFinish_stopsServiceOnlyAfterItsOwnTasksFinish() {
    when(reactHost.getCurrentReactContext()).thenReturn(reactContext);
    when(reactContext.hasActiveReactInstance()).thenReturn(true);
    start(1);
    start(2);
    idle();
    ArgumentCaptor<Integer> taskIds = ArgumentCaptor.forClass(Integer.class);
    verify(appRegistry, times(2)).startHeadlessTask(taskIds.capture(), eq(TASK_KEY), any());

    headlessContext().finishTask(taskIds.getAllValues().get(0));
    idle();
    service.onHeadlessJsTaskFinish(Integer.MAX_VALUE);
    assertFalse(stoppedBySelf());

    headlessContext().finishTask(taskIds.getAllValues().get(1));
    idle();
    assertTrue(stoppedBySelf());
    assertEquals(2, shadowService().getStopSelfResultId());
  }

  @Test
  public void stop_passesLatestStartIdIncludingIgnoredIntents() {
    when(reactHost.getCurrentReactContext()).thenReturn(reactContext);
    when(reactContext.hasActiveReactInstance()).thenReturn(true);
    start(1);
    start(3);
    service.onStartCommand(new Intent(), 0, 5);
    idle();
    ArgumentCaptor<Integer> taskIds = ArgumentCaptor.forClass(Integer.class);
    verify(appRegistry, times(2)).startHeadlessTask(taskIds.capture(), eq(TASK_KEY), any());

    headlessContext().finishTask(taskIds.getAllValues().get(0));
    idle();
    assertFalse(stoppedBySelf());

    headlessContext().finishTask(taskIds.getAllValues().get(1));
    idle();
    assertTrue(stoppedBySelf());
    assertEquals(5, shadowService().getStopSelfResultId());
  }

  @Test
  public void drainedByLaterIntent_leftoverListenerFiringWhileInactive_isIgnored() {
    when(reactHost.getCurrentReactContext()).thenReturn(reactContext);
    start(1);
    ReactInstanceEventListener listener = capturedHostListener();

    when(reactContext.hasActiveReactInstance()).thenReturn(true);
    start(2);
    idle();
    verifyDelivered(1);
    verifyDelivered(2);
    verify(reactHost).removeReactInstanceEventListener(listener);

    when(reactContext.hasActiveReactInstance()).thenReturn(false);
    listener.onReactContextInitialized(reactContext);
    idle();

    verify(reactHost).addReactInstanceEventListener(any());
    idleFor(TIMEOUT_MS);
    assertTrue(ShadowLog.getLogsForTag("RNFirebaseMsgHeadless").isEmpty());
  }

  @Test
  public void jsQueueUnavailable_handlesReadyOnUiThread() {
    doAnswer(invocation -> false).when(reactContext).runOnJSQueueThread(any());
    start(1);
    ReactInstanceEventListener listener = capturedHostListener();

    becomeReady(listener);

    verifyDelivered(1);
    verify(reactHost).removeReactInstanceEventListener(listener);
  }

  @Test
  public void taskFinishWhileOthersQueued_keepsServiceRunning() {
    when(reactHost.getCurrentReactContext()).thenReturn(reactContext);
    when(reactContext.hasActiveReactInstance()).thenReturn(true);
    start(1);
    idle();
    when(reactContext.hasActiveReactInstance()).thenReturn(false);
    start(2);
    ArgumentCaptor<Integer> taskId = ArgumentCaptor.forClass(Integer.class);
    verify(appRegistry).startHeadlessTask(taskId.capture(), eq(TASK_KEY), any());

    headlessContext().finishTask(taskId.getValue());
    idle();

    assertFalse(stoppedBySelf());
  }

  @Test
  public void drainedTaskFinish_stopsService() {
    when(reactHost.getCurrentReactContext()).thenReturn(reactContext);
    start(1);
    becomeReady(capturedHostListener());
    ArgumentCaptor<Integer> taskId = ArgumentCaptor.forClass(Integer.class);
    verify(appRegistry).startHeadlessTask(taskId.capture(), eq(TASK_KEY), any());

    headlessContext().finishTask(taskId.getValue());
    idle();

    assertTrue(stoppedBySelf());
  }

  @Test
  public void bridge_noContext_createsContextAndStartsTaskOnceInitialized() {
    ReactInstanceManager reactInstanceManager = useBridge(false);

    start(1);
    idle();

    ArgumentCaptor<ReactInstanceEventListener> captor =
        ArgumentCaptor.forClass(ReactInstanceEventListener.class);
    verify(reactInstanceManager).addReactInstanceEventListener(captor.capture());
    verify(reactInstanceManager).createReactContextInBackground();
    verifyNothingStarted();

    when(reactContext.hasActiveReactInstance()).thenReturn(true);
    when(reactInstanceManager.getCurrentReactContext()).thenReturn(reactContext);
    captor.getValue().onReactContextInitialized(reactContext);
    idle();

    verifyDelivered(1);
    verify(reactInstanceManager).removeReactInstanceEventListener(captor.getValue());
    verify(reactHost, never()).addReactInstanceEventListener(any());
  }

  @Test
  public void bridge_creationAlreadyStarted_doesNotCreateContextAgain() {
    ReactInstanceManager reactInstanceManager = useBridge(true);

    start(1);
    idle();

    verify(reactInstanceManager).addReactInstanceEventListener(any());
    verify(reactInstanceManager, never()).createReactContextInBackground();
  }

  private ReactInstanceManager useBridge(boolean creationStarted) {
    featureFlags
        .when(ReactNativeNewArchitectureFeatureFlags::enableBridgelessArchitecture)
        .thenReturn(false);
    ReactInstanceManager reactInstanceManager = mock(ReactInstanceManager.class);
    when(reactInstanceManager.hasStartedCreatingInitialContext()).thenReturn(creationStarted);
    ReactNativeHost nativeHost = mock(ReactNativeHost.class);
    when(nativeHost.getReactInstanceManager()).thenReturn(reactInstanceManager);
    service.nativeHost = nativeHost;
    return reactInstanceManager;
  }

  @Test
  public void bridgelessFlag_readsContextFromAndWaitsOnReactHost() {
    ReactNativeHost nativeHost = mock(ReactNativeHost.class);
    service.nativeHost = nativeHost;

    start(1);
    idle();

    verify(reactHost).getCurrentReactContext();
    verify(reactHost).addReactInstanceEventListener(any());
    verify(reactHost).start();
    verifyNoInteractions(nativeHost);
    verifyNothingStarted();
  }

  @Test
  public void bridgelessFlag_withoutReactHost_throwsIllegalState() {
    service.host = null;
    try {
      IllegalStateException error = assertThrows(IllegalStateException.class, () -> start(1));

      assertEquals("ReactHost is not initialized in New Architecture", error.getMessage());
      verify(appRegistry, never()).startHeadlessTask(anyInt(), any(), any());
    } finally {
      service.host = reactHost;
    }
  }

  @Test
  public void bridgeFlag_readsContextFromAndWaitsOnReactInstanceManager() {
    ReactInstanceManager reactInstanceManager = useBridge(false);
    when(reactHost.getCurrentReactContext()).thenReturn(reactContext);
    when(reactContext.hasActiveReactInstance()).thenReturn(true);

    start(1);
    idle();

    verify(reactInstanceManager).getCurrentReactContext();
    verify(reactInstanceManager).addReactInstanceEventListener(any());
    verifyNoInteractions(reactHost);
    verifyNothingStarted();
  }

  @Test
  public void bridge_contextWithoutActiveInstance_waitsWithoutCreatingContext() {
    ReactInstanceManager reactInstanceManager = useBridge(false);
    when(reactInstanceManager.getCurrentReactContext()).thenReturn(reactContext);

    start(1);
    idle();

    verify(reactInstanceManager).addReactInstanceEventListener(any());
    verify(reactInstanceManager, never()).createReactContextInBackground();
    verifyNothingStarted();
  }

  @Test
  public void messageIntent_buildsForegroundAllowedTaskWithConfiguredTimeout() {
    WritableMap body = mock(WritableMap.class);
    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      arguments.when(Arguments::createMap).thenReturn(body);
      RemoteMessage message = new RemoteMessage.Builder("dest").setMessageId("m-1").build();

      HeadlessJsTaskConfig config =
          service.getTaskConfig(new Intent().putExtra("message", message));

      assertEquals(TASK_KEY, config.getTaskKey());
      assertSame(body, config.getData());
      assertEquals(
          ReactNativeFirebaseJSON.getSharedInstance()
              .getLongValue("messaging_android_headless_task_timeout", 60000),
          config.getTimeout());
      assertTrue(config.isAllowedInForeground());
    }
  }

  @Test
  public void intentWithoutExtras_isIgnored() {
    assertEquals(Service.START_NOT_STICKY, service.onStartCommand(new Intent(), 0, 1));
    verify(reactHost, never()).addReactInstanceEventListener(any());
    assertNull(ShadowPowerManager.getLatestWakeLock());
  }
}
