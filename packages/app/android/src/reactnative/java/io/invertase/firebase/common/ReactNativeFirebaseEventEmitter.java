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

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import androidx.annotation.MainThread;
import androidx.annotation.Nullable;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactHost;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import io.invertase.firebase.app.ReactNativeFirebaseApp;
import io.invertase.firebase.interfaces.NativeEvent;
import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class ReactNativeFirebaseEventEmitter {
  private static final String TAG = "RNFB_EMITTER";
  private static ReactNativeFirebaseEventEmitter sharedInstance =
      new ReactNativeFirebaseEventEmitter();
  private final Handler handler = new Handler(Looper.getMainLooper());

  // All mutable state below is guarded by the jsListeners monitor. Attach/detach/ready
  // transitions happen synchronously at cause time under the same monitor as listener
  // registration: with more than one ReactContext generation alive during an instance
  // reload, deferring any of these transitions (e.g. to a congested main looper) reorders
  // them against a replacement runtime's synchronous registrations and can wipe or wedge
  // that runtime's state. Only queue flushing is posted to the main thread.
  private final List<NativeEvent> queuedEvents = new ArrayList<>();
  private final HashMap<String, Integer> jsListeners = new HashMap<>();
  // Weak so the emitter never pins a dead ReactContext (and its module graph) for the
  // lifetime of the process if a runtime is torn down without a paired detach.
  private WeakReference<ReactContext> attachedReactContext = new WeakReference<>(null);
  private boolean jsReady = false;
  private int jsListenerCount;

  public static ReactNativeFirebaseEventEmitter getSharedInstance() {
    return sharedInstance;
  }

  public void attachReactContext(final ReactContext reactContext) {
    synchronized (jsListeners) {
      // Under the new architecture more than one ReactContext generation can exist while an
      // instance is destroyed and recreated: a module belonging to the dying generation may
      // run initialize() after the replacement generation has already attached (for example
      // TurboModuleManager creates requested-but-never-built modules during invalidate).
      // Accepting such a late attach would leave this process-lifetime singleton emitting
      // into a runtime that has no JS listeners for the rest of the session (#8374), so when
      // something is already attached, only accept the context the host currently considers
      // active. An empty emitter accepts any attach: with nothing attached there is no good
      // state to protect, and hosts that cannot be resolved must keep working as before.
      ReactContext previousContext = attachedReactContext.get();
      if (previousContext != null && previousContext != reactContext) {
        ReactContext currentContext = getCurrentReactContextFromHost(reactContext);
        if (currentContext != null && currentContext != reactContext) {
          Log.w(
              TAG,
              "Ignoring attach of non-current ReactContext@"
                  + System.identityHashCode(reactContext)
                  + ", current is @"
                  + System.identityHashCode(currentContext));
          return;
        }
        Log.i(
            TAG,
            "ReactContext changed: @"
                + System.identityHashCode(previousContext)
                + " -> @"
                + System.identityHashCode(reactContext));
      }
      if (previousContext != reactContext) {
        attachedReactContext = new WeakReference<>(reactContext);
      }
    }

    handler.post(this::sendQueuedEvents);
  }

  public void detachReactContext(final ReactContext reactContext) {
    synchronized (jsListeners) {
      // Only clear state installed by the runtime that is going away; a dying generation
      // must not wipe listener registrations a replacement runtime has already made. A
      // replacement runtime always attaches (synchronously, at module creation) before its
      // JS can register listeners, so an identity match here means the dying state is ours.
      if (attachedReactContext.get() != reactContext) {
        return;
      }

      Log.i(TAG, "Detached ReactContext@" + System.identityHashCode(reactContext));
      attachedReactContext = new WeakReference<>(null);
      jsReady = false;
      jsListeners.clear();
      jsListenerCount = 0;
      // queuedEvents are intentionally kept: they drain once the next runtime attaches and
      // registers listeners, which is how events raised while no runtime is alive (for
      // example messaging events for a killed app) reach JS.
    }
  }

  public void notifyJsReady(Boolean ready) {
    synchronized (jsListeners) {
      jsReady = ready;
    }

    handler.post(this::sendQueuedEvents);
  }

  public void sendEvent(final NativeEvent event) {
    handler.post(
        () -> {
          synchronized (jsListeners) {
            if (!jsListeners.containsKey(event.getEventName()) || !emit(event)) {
              queuedEvents.add(event);
            }
          }
        });
  }

  public void addListener(String eventName) {
    synchronized (jsListeners) {
      jsListenerCount++;
      if (!jsListeners.containsKey(eventName)) {
        jsListeners.put(eventName, 1);
      } else {
        int listenersForEvent = jsListeners.get(eventName);
        jsListeners.put(eventName, listenersForEvent + 1);
      }
    }

    handler.post(this::sendQueuedEvents);
  }

  public void removeListener(String eventName, Boolean all) {
    synchronized (jsListeners) {
      if (jsListeners.containsKey(eventName)) {
        int listenersForEvent = jsListeners.get(eventName);

        if (listenersForEvent <= 1 || all) {
          jsListeners.remove(eventName);
        } else {
          jsListeners.put(eventName, listenersForEvent - 1);
        }

        jsListenerCount -= all ? listenersForEvent : 1;
      }
    }
  }

  public WritableMap getListenersMap() {
    WritableMap writableMap = Arguments.createMap();
    WritableMap events = Arguments.createMap();

    synchronized (jsListeners) {
      ReactContext attachedContext = attachedReactContext.get();
      ReactContext currentContext = getCurrentReactContextFromHost(attachedContext);

      writableMap.putInt("listeners", jsListenerCount);
      writableMap.putInt("queued", queuedEvents.size());
      writableMap.putBoolean("jsReady", jsReady);
      writableMap.putInt(
          "attachedContextHash",
          attachedContext == null ? 0 : System.identityHashCode(attachedContext));
      writableMap.putInt(
          "currentContextHash",
          currentContext == null ? 0 : System.identityHashCode(currentContext));

      for (HashMap.Entry<String, Integer> entry : jsListeners.entrySet()) {
        events.putInt(entry.getKey(), entry.getValue());
      }
    }

    writableMap.putMap("events", events);

    return writableMap;
  }

  @MainThread
  private void sendQueuedEvents() {
    synchronized (jsListeners) {
      for (NativeEvent event : new ArrayList<>(queuedEvents)) {
        if (jsListeners.containsKey(event.getEventName())) {
          queuedEvents.remove(event);
          sendEvent(event);
        }
      }
    }
  }

  @MainThread
  private boolean emit(final NativeEvent event) {
    if (!jsReady) {
      return false;
    }

    // Resolve the context hosting the live JS runtime at emit time rather than trusting the
    // attached one: a context captured at module-creation time can belong to a previous
    // generation whose runtime no longer contains the JS listeners, and on bridgeless a stale
    // context still reports an active instance so it cannot be validated - only replaced
    // (#8374, #8900).
    ReactContext emitContext = getCurrentReactContextFromHost(attachedReactContext.get());
    if (emitContext == null) {
      emitContext = attachedReactContext.get();
    }

    if (emitContext == null || !emitContext.hasActiveReactInstance()) {
      return false;
    }

    try {
      emitContext
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
          .emit("rnfb_" + event.getEventName(), event.getEventBody());
    } catch (Exception e) {
      Log.wtf(TAG, "Error sending Event " + event.getEventName(), e);
      return false;
    }

    return true;
  }

  @Nullable
  private static ReactContext getCurrentReactContextFromHost(@Nullable ReactContext contextHint) {
    Context applicationContext =
        contextHint != null
            ? contextHint.getApplicationContext()
            : ReactNativeFirebaseApp.getApplicationContext();
    if (applicationContext != null) {
      // Normalize in case a non-application context (for example a ContentProvider context)
      // was stored as the fallback.
      applicationContext = applicationContext.getApplicationContext();
    }
    if (!(applicationContext instanceof ReactApplication)) {
      // Brownfield hosts that do not implement ReactApplication fall back to the attached
      // context, preserving pre-existing behaviour.
      return null;
    }

    ReactApplication reactApplication = (ReactApplication) applicationContext;

    // Note: these getters may lazily construct their host on first call; that is acceptable
    // here because a live react-native-firebase module implies the app's host already exists.
    try {
      ReactHost reactHost = reactApplication.getReactHost();
      if (reactHost != null) {
        return reactHost.getCurrentReactContext();
      }
    } catch (RuntimeException | LinkageError e) {
      // App-authored hosts may throw, and react-native 0.83+ throws from the deprecated
      // reactNativeHost getter on bridgeless-only apps.
      Log.d(TAG, "Failed to resolve current ReactContext via ReactHost", e);
    }

    try {
      ReactNativeHost reactNativeHost = reactApplication.getReactNativeHost();
      // hasInstance() guards against getReactInstanceManager() eagerly creating an instance
      // manager purely as a side effect of emitting an event.
      if (reactNativeHost != null && reactNativeHost.hasInstance()) {
        return reactNativeHost.getReactInstanceManager().getCurrentReactContext();
      }
    } catch (RuntimeException | LinkageError e) {
      Log.d(TAG, "Failed to resolve current ReactContext via ReactNativeHost", e);
    }

    return null;
  }
}
