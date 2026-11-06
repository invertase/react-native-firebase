package io.invertase.firebase.messaging;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.ReactHost;
import com.facebook.react.ReactInstanceEventListener;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.internal.featureflags.ReactNativeNewArchitectureFeatureFlags;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;
import com.facebook.react.jstasks.HeadlessJsTaskContext;
import com.google.firebase.messaging.RemoteMessage;
import io.invertase.firebase.common.ReactNativeFirebaseJSON;
import java.util.ArrayDeque;
import java.util.HashSet;
import java.util.Set;
import javax.annotation.Nullable;

/**
 * Runs background messages as headless JS tasks.
 *
 * <p>The stock {@link HeadlessJsTaskService#startTask} only waits for React when there is no
 * context yet. During a cold start the bridgeless host exposes its context before the React
 * instance is attached, and a task started in that window is dropped by {@link
 * HeadlessJsTaskContext} ("CatalystInstance not available") while still holding the wake lock until
 * its timeout. This service queues tasks until the instance is ready and starts them in arrival
 * order.
 */
public class ReactNativeFirebaseMessagingHeadlessService extends HeadlessJsTaskService {
  private static final String TAG = "RNFirebaseMsgHeadless";
  private static final long TIMEOUT_DEFAULT = 60000;
  private static final String TIMEOUT_JSON_KEY = "messaging_android_headless_task_timeout";
  private static final String TASK_KEY = "ReactNativeFirebaseMessagingHeadlessTask";

  private final ArrayDeque<HeadlessJsTaskConfig> pendingTasks = new ArrayDeque<>();
  private final Set<Integer> activeTaskIds = new HashSet<>();
  private @Nullable ReactInstanceEventListener readyListener;
  private boolean readyListenerOnReactHost;
  private @Nullable Runnable readyTimeout;
  private int lastStartId;

  @Override
  protected @Nullable HeadlessJsTaskConfig getTaskConfig(Intent intent) {
    Bundle extras = intent.getExtras();
    if (extras == null) return null;
    RemoteMessage remoteMessage = intent.getParcelableExtra("message");

    return new HeadlessJsTaskConfig(
        TASK_KEY,
        ReactNativeFirebaseMessagingSerializer.remoteMessageToWritableMap(remoteMessage),
        ReactNativeFirebaseJSON.getSharedInstance().getLongValue(TIMEOUT_JSON_KEY, TIMEOUT_DEFAULT),
        // Prevents race condition where the user opens the app at the same time as a notification
        // is delivered, causing a crash.
        true);
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    lastStartId = startId;
    HeadlessJsTaskConfig taskConfig = getTaskConfig(intent);
    if (taskConfig == null) {
      return START_NOT_STICKY;
    }
    UiThreadUtil.assertOnUiThread();
    acquireWakeLockNow(this);
    pendingTasks.add(taskConfig);
    startPendingTasksOrWait();
    return START_REDELIVER_INTENT;
  }

  private void startPendingTasksOrWait() {
    // Same flag as HeadlessJsTaskService.getReactContext, so the context is read from the host the
    // listener is registered on.
    boolean bridgeless = isBridgelessEnabled();
    ReactContext reactContext =
        bridgeless
            ? requireReactHost().getCurrentReactContext()
            : getReactNativeHost().getReactInstanceManager().getCurrentReactContext();
    if (reactContext != null && reactContext.hasActiveReactInstance()) {
      startPendingTasks(reactContext);
      return;
    }
    if (readyListener == null) {
      waitForReactInstance(bridgeless, reactContext == null);
    }
    if (readyTimeout == null) {
      scheduleReadyTimeout(pendingTasks.peek().getTimeout());
    }
  }

  private void startPendingTasks(ReactContext reactContext) {
    cancelReadyTimeout();
    removeReadyListener();
    HeadlessJsTaskContext headlessJsTaskContext = HeadlessJsTaskContext.getInstance(reactContext);
    headlessJsTaskContext.addTaskEventListener(this);
    while (!pendingTasks.isEmpty()) {
      activeTaskIds.add(headlessJsTaskContext.startTask(pendingTasks.poll()));
    }
  }

  private void waitForReactInstance(boolean bridgeless, boolean startReact) {
    ReactInstanceEventListener listener =
        new ReactInstanceEventListener() {
          @Override
          public void onReactContextInitialized(ReactContext context) {
            Runnable ready = () -> onReactInstanceReady(this);
            // Hop through the JS queue so the bundle that registers the task has run first.
            if (!context.runOnJSQueueThread(() -> UiThreadUtil.runOnUiThread(ready))) {
              UiThreadUtil.runOnUiThread(ready);
            }
          }
        };
    readyListener = listener;
    readyListenerOnReactHost = bridgeless;
    if (bridgeless) {
      ReactHost reactHost = requireReactHost();
      reactHost.addReactInstanceEventListener(listener);
      if (startReact) {
        reactHost.start();
      }
    } else {
      ReactInstanceManager reactInstanceManager = getReactNativeHost().getReactInstanceManager();
      reactInstanceManager.addReactInstanceEventListener(listener);
      if (startReact && !reactInstanceManager.hasStartedCreatingInitialContext()) {
        reactInstanceManager.createReactContextInBackground();
      }
    }
  }

  private void onReactInstanceReady(ReactInstanceEventListener listener) {
    if (readyListener != listener) {
      return;
    }
    removeReadyListener();
    startPendingTasksOrWait();
  }

  private void removeReadyListener() {
    ReactInstanceEventListener listener = readyListener;
    if (listener == null) {
      return;
    }
    readyListener = null;
    if (readyListenerOnReactHost) {
      requireReactHost().removeReactInstanceEventListener(listener);
    } else {
      getReactNativeHost().getReactInstanceManager().removeReactInstanceEventListener(listener);
    }
  }

  private void scheduleReadyTimeout(long timeout) {
    if (timeout <= 0) {
      return;
    }
    readyTimeout =
        () -> {
          readyTimeout = null;
          Log.w(
              TAG,
              "React instance not ready after "
                  + timeout
                  + "ms, dropping "
                  + pendingTasks.size()
                  + " background message task(s)");
          pendingTasks.clear();
          removeReadyListener();
          if (activeTaskIds.isEmpty()) {
            stopSelfUnlessRestarted();
          }
        };
    UiThreadUtil.runOnUiThread(readyTimeout, timeout);
  }

  private void cancelReadyTimeout() {
    if (readyTimeout != null) {
      UiThreadUtil.removeOnUiThread(readyTimeout);
      readyTimeout = null;
    }
  }

  // stopSelfResult keeps the service alive when a newer start is already on its way to
  // onStartCommand; a plain stopSelf would destroy it and onDestroy would drop that start.
  private void stopSelfUnlessRestarted() {
    stopSelfResult(lastStartId);
  }

  private static boolean isBridgelessEnabled() {
    return ReactNativeNewArchitectureFeatureFlags.enableBridgelessArchitecture();
  }

  private ReactHost requireReactHost() {
    ReactHost reactHost = getReactHost();
    if (reactHost == null) {
      throw new IllegalStateException("ReactHost is not initialized in New Architecture");
    }
    return reactHost;
  }

  @Override
  public void onHeadlessJsTaskFinish(int taskId) {
    if (activeTaskIds.remove(taskId) && activeTaskIds.isEmpty() && pendingTasks.isEmpty()) {
      stopSelfUnlessRestarted();
    }
  }

  @Override
  public void onDestroy() {
    cancelReadyTimeout();
    removeReadyListener();
    pendingTasks.clear();
    super.onDestroy();
  }
}
