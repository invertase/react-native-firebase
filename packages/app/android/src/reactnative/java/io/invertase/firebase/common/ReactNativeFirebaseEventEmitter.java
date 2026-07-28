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
  // When the host still names a dying generation, a live module's attach is remembered here
  // and promoted once that dying context detaches or the host catches up — without waiting
  // solely on a later Activity resume that may never arrive.
  private WeakReference<ReactContext> pendingReactContext = new WeakReference<>(null);
  // Host identity we moved past while converging onto pending/attached; late attaches of this
  // identity must not displace the live generation while the host ref lags.
  private WeakReference<ReactContext> hostLagReactContext = new WeakReference<>(null);
  // When a new pending candidate enters while the attached generation still lives, listener
  // accounting is reset so events queue until the pending JS re-registers. Keep a snapshot of
  // the attached generation's accounting so a pending-only cancel can restore it — otherwise
  // the surviving attached runtime stays deaf for the rest of the session (#8374-class).
  @Nullable private HashMap<String, Integer> attachedListenersSnapshot;
  private boolean attachedJsReadySnapshot;
  private int attachedJsListenerCountSnapshot;
  // After pending-only cancel restores that snapshot, emit must keep targeting the restored
  // attached generation even if the host has already advanced to an unrelated unattached
  // context — otherwise resolveEmitContext prefers raw hostCurrent and silently loses events
  // into a runtime with no RNFB JS subscribers (R1 class after cancel). Cleared when a new
  // generation attaches through acceptAttachedContext / convergence / full detach.
  private boolean emitPrefersRestoredAttached;
  private boolean jsReady = false;
  private int jsListenerCount;

  public static ReactNativeFirebaseEventEmitter getSharedInstance() {
    return sharedInstance;
  }

  public void attachReactContext(final ReactContext reactContext) {
    // Resolve host current outside jsListeners so ReactApplication getters are not held
    // under the listener monitor (they are RN-owned and not expected to re-enter, but the
    // coupling is unnecessary for attach arbitration).
    ReactContext hostCurrent = getCurrentReactContextFromHost(reactContext);

    synchronized (jsListeners) {
      // Under the new architecture more than one ReactContext generation can exist while an
      // instance is destroyed and recreated: a module belonging to the dying generation may
      // run initialize() after the replacement generation has already attached (for example
      // TurboModuleManager creates requested-but-never-built modules during invalidate).
      // Attach is fail-closed when something is already attached: accept the candidate only
      // when the host currently names it. A null host current keeps the previous attachment
      // rather than accepting a late stale context. When the host still names the previous
      // (dying) context, remember the candidate as pending so detach/host catch-up can
      // converge without depending only on a later Activity resume.
      ReactContext previousContext = attachedReactContext.get();
      if (previousContext != null && previousContext != reactContext) {
        if (hostCurrent == null) {
          Log.w(
              TAG,
              "Ignoring attach of ReactContext@"
                  + System.identityHashCode(reactContext)
                  + " while host current is null; keeping @"
                  + System.identityHashCode(previousContext));
          return;
        }

        ReactContext hostLag = hostLagReactContext.get();
        if (hostCurrent == reactContext) {
          if (hostLag != null && hostLag == reactContext) {
            Log.w(
                TAG,
                "Ignoring attach of host-lag ReactContext@"
                    + System.identityHashCode(reactContext)
                    + "; keeping live @"
                    + System.identityHashCode(previousContext));
            return;
          }
          acceptAttachedContext(
              reactContext, /* resetListenerState= */ pendingReactContext.get() != reactContext);
          clearConvergenceState();
          discardAttachedListenerSnapshot();
        } else if (hostCurrent == previousContext) {
          // Host still names the dying attached generation. Remember the candidate as pending
          // so detach/host catch-up can converge. Idempotent re-attach of the same pending
          // identity (e.g. async onHostResume while the host still lags) must not wipe
          // listeners the pending JS already registered. Reset only when entering pending for
          // a new candidate: first pending, or last-writer-wins replace of a different one.
          ReactContext existingPending = pendingReactContext.get();
          boolean newPendingCandidate = existingPending != reactContext;
          Log.i(
              TAG,
              "Host still on @"
                  + System.identityHashCode(previousContext)
                  + "; pending attach of @"
                  + System.identityHashCode(reactContext)
                  + (newPendingCandidate ? "" : " (idempotent)"));
          pendingReactContext = new WeakReference<>(reactContext);
          hostLagReactContext = new WeakReference<>(previousContext);
          if (newPendingCandidate) {
            // Drop previous-generation listener accounting; replacement JS will re-register.
            // Snapshot once per pending window so pending-only cancel can restore the
            // surviving attached generation (last-writer-wins replace keeps the first
            // snapshot — that is still the attached runtime's pre-pending state).
            snapshotAttachedListenerStateIfNeeded();
            resetListenerState();
          }
          handler.post(this::tryConvergePendingReactContext);
          return;
        } else {
          Log.w(
              TAG,
              "Ignoring attach of non-current ReactContext@"
                  + System.identityHashCode(reactContext)
                  + ", current is @"
                  + System.identityHashCode(hostCurrent));
          return;
        }
      } else if (previousContext != reactContext) {
        acceptAttachedContext(reactContext, /* resetListenerState= */ false);
        clearConvergenceState();
      } else {
        // Same context re-attach (e.g. resume). Clear lag only when this identity is the
        // live pending/attached generation the host has caught up to — not when we are
        // still the dying hostLag while a different pending replacement is waiting.
        if (hostCurrent == reactContext) {
          ReactContext pending = pendingReactContext.get();
          if (pending == null || pending == reactContext) {
            clearConvergenceState();
          }
        }
      }
    }

    handler.post(this::sendQueuedEvents);
  }

  public void detachReactContext(final ReactContext reactContext) {
    synchronized (jsListeners) {
      // Pending-only invalidate (failed replacement startup / overlapping teardown): the
      // candidate never became attached, so cancel it before the attached-identity check.
      // Restore the surviving attached generation's listener / jsReady snapshot taken when
      // pending first entered — pending-window registrations belong to the cancelled
      // generation and must not leave the attached runtime deaf. Superseded identities that
      // are not the current pending fall through and no-op below — they must not wipe a
      // newer live pending's registrations.
      ReactContext pending = pendingReactContext.get();
      if (pending == reactContext && attachedReactContext.get() != reactContext) {
        Log.i(
            TAG,
            "Cancelled pending ReactContext@"
                + System.identityHashCode(reactContext)
                + "; attached remains @"
                + System.identityHashCode(attachedReactContext.get()));
        clearConvergenceState();
        restoreAttachedListenerSnapshot();
        // Events queued while the pending window wiped listeners must drain now — attached
        // JS already registered before pending entered and will not re-addListener.
        handler.post(this::sendQueuedEvents);
        return;
      }

      // Only clear state installed by the runtime that is going away; a dying generation
      // must not wipe listener registrations a replacement runtime has already made. A
      // replacement runtime always attaches (synchronously, at module creation) before its
      // JS can register listeners, so an identity match here means the dying state is ours.
      if (attachedReactContext.get() != reactContext) {
        return;
      }

      if (pending != null && pending != reactContext) {
        Log.i(
            TAG,
            "Detached ReactContext@"
                + System.identityHashCode(reactContext)
                + "; promoting pending @"
                + System.identityHashCode(pending));
        attachedReactContext = new WeakReference<>(pending);
        pendingReactContext = new WeakReference<>(null);
        // Keep jsReady / jsListeners: they belong to the promoted generation's JS.
        // hostLag stays set so emit and late attaches do not regress to the dying identity
        // while the host ref still names it.
        discardAttachedListenerSnapshot();
        emitPrefersRestoredAttached = false;
        handler.post(this::sendQueuedEvents);
        return;
      }

      Log.i(TAG, "Detached ReactContext@" + System.identityHashCode(reactContext));
      attachedReactContext = new WeakReference<>(null);
      resetListenerState();
      clearConvergenceState();
      discardAttachedListenerSnapshot();
      emitPrefersRestoredAttached = false;
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
            if (!jsListeners.containsKey(event.getEventName())) {
              queuedEvents.add(event);
              return;
            }
          }
          // emit() resolves ReactApplication host current outside jsListeners; do not hold
          // the monitor across that call.
          if (!emit(event)) {
            synchronized (jsListeners) {
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

    // Resolve host current outside jsListeners; converge/snapshot under the monitor.
    ReactContext pendingHint;
    ReactContext attachedHint;
    synchronized (jsListeners) {
      pendingHint = pendingReactContext.get();
      attachedHint = attachedReactContext.get();
    }
    ReactContext hostForConverge =
        getCurrentReactContextFromHost(pendingHint != null ? pendingHint : attachedHint);

    ReactContext attachedContext;
    synchronized (jsListeners) {
      tryConvergePendingReactContextLocked(hostForConverge);
      attachedContext = attachedReactContext.get();

      writableMap.putInt("listeners", jsListenerCount);
      writableMap.putInt("queued", queuedEvents.size());
      writableMap.putBoolean("jsReady", jsReady);
      writableMap.putInt(
          "attachedContextHash",
          attachedContext == null ? 0 : System.identityHashCode(attachedContext));

      for (HashMap.Entry<String, Integer> entry : jsListeners.entrySet()) {
        events.putInt(entry.getKey(), entry.getValue());
      }
    }

    ReactContext currentContext = getCurrentReactContextFromHost(attachedContext);
    writableMap.putInt(
        "currentContextHash", currentContext == null ? 0 : System.identityHashCode(currentContext));
    writableMap.putMap("events", events);

    return writableMap;
  }

  @MainThread
  private void sendQueuedEvents() {
    List<NativeEvent> toSend;
    synchronized (jsListeners) {
      toSend = new ArrayList<>();
      for (NativeEvent event : new ArrayList<>(queuedEvents)) {
        if (jsListeners.containsKey(event.getEventName())) {
          queuedEvents.remove(event);
          toSend.add(event);
        }
      }
    }
    for (NativeEvent event : toSend) {
      sendEvent(event);
    }
  }

  @MainThread
  private boolean emit(final NativeEvent event) {
    // Snapshot readiness / pointers under the monitor, resolve host current outside (avoid
    // holding jsListeners across ReactApplication getters), then re-enter to converge/resolve.
    ReactContext attachedHint;
    boolean ready;
    synchronized (jsListeners) {
      ready = jsReady;
      if (!ready) {
        return false;
      }
      attachedHint = attachedReactContext.get();
      if (attachedHint == null) {
        attachedHint = pendingReactContext.get();
      }
    }
    ReactContext hostCurrent = getCurrentReactContextFromHost(attachedHint);

    ReactContext emitContext;
    synchronized (jsListeners) {
      if (!jsReady) {
        return false;
      }
      tryConvergePendingReactContextLocked(hostCurrent);

      // Resolve the context hosting the live JS runtime at emit time rather than trusting the
      // attached one alone: a context captured at module-creation time can belong to a previous
      // generation whose runtime no longer contains the JS listeners, and on bridgeless a stale
      // context still reports an active instance so it cannot be validated - only replaced
      // (#8374, #8900). When attached has already converged ahead of a lagging host ref, prefer
      // attached over the dying host current so events are not delivered into a runtime with no
      // listeners.
      ReactContext attached = attachedReactContext.get();
      emitContext = resolveEmitContext(attached, hostCurrent);
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
  private ReactContext resolveEmitContext(
      @Nullable ReactContext attached, @Nullable ReactContext hostCurrent) {
    ReactContext pending = pendingReactContext.get();
    ReactContext hostLag = hostLagReactContext.get();

    // A pending replacement owns (or will own) the listener map. Prefer it over host/attached
    // for the whole pending window — including when the host has already advanced to an
    // unrelated third generation that has not yet attached via this emitter. Emitting into
    // that third context would return true with no RNFB JS subscribers and no re-queue.
    if (pending != null) {
      return pending;
    }

    if (hostCurrent == null) {
      return attached;
    }
    if (attached == null || attached == hostCurrent) {
      if (attached == hostCurrent) {
        clearConvergenceState();
        emitPrefersRestoredAttached = false;
      }
      return hostCurrent;
    }

    if (hostLag != null && hostLag == hostCurrent) {
      return attached;
    }

    // Pending-only cancel restored listeners onto attached; an unrelated hostCurrent that has
    // not yet attached through this emitter must not steal delivery (silent loss, no re-queue).
    // Flag is only set while an attached generation still owns the restored map.
    if (emitPrefersRestoredAttached) {
      return attached;
    }

    // Attached is stale relative to a host that has moved on — prefer the host.
    return hostCurrent;
  }

  private void tryConvergePendingReactContext() {
    ReactContext pendingHint;
    synchronized (jsListeners) {
      pendingHint = pendingReactContext.get();
    }
    if (pendingHint == null) {
      return;
    }
    ReactContext hostCurrent = getCurrentReactContextFromHost(pendingHint);
    synchronized (jsListeners) {
      if (tryConvergePendingReactContextLocked(hostCurrent)) {
        handler.post(this::sendQueuedEvents);
      }
    }
  }

  /**
   * Prefer resolving {@code hostCurrent} outside {@code jsListeners} and passing it in so
   * ReactApplication getters are not held under the listener monitor.
   *
   * @return true when attachment changed
   */
  private boolean tryConvergePendingReactContextLocked(@Nullable ReactContext hostCurrent) {
    ReactContext pending = pendingReactContext.get();
    if (pending == null) {
      return false;
    }
    if (hostCurrent != pending) {
      return false;
    }
    ReactContext previous = attachedReactContext.get();
    if (previous == pending) {
      clearConvergenceState();
      return false;
    }
    Log.i(
        TAG, "Host caught up; attaching pending ReactContext@" + System.identityHashCode(pending));
    acceptAttachedContext(pending, /* resetListenerState= */ false);
    clearConvergenceState();
    discardAttachedListenerSnapshot();
    return true;
  }

  private void acceptAttachedContext(ReactContext reactContext, boolean resetListenerState) {
    ReactContext previousContext = attachedReactContext.get();
    if (previousContext != reactContext) {
      Log.i(
          TAG,
          "ReactContext changed: @"
              + System.identityHashCode(previousContext)
              + " -> @"
              + System.identityHashCode(reactContext));
      attachedReactContext = new WeakReference<>(reactContext);
      // A real attach of a new generation supersedes restored-attached emit affinity.
      emitPrefersRestoredAttached = false;
      if (resetListenerState) {
        discardAttachedListenerSnapshot();
        resetListenerState();
      }
    }
  }

  private void resetListenerState() {
    jsReady = false;
    jsListeners.clear();
    jsListenerCount = 0;
  }

  private void snapshotAttachedListenerStateIfNeeded() {
    if (attachedListenersSnapshot != null) {
      return;
    }
    attachedListenersSnapshot = new HashMap<>(jsListeners);
    attachedJsReadySnapshot = jsReady;
    attachedJsListenerCountSnapshot = jsListenerCount;
  }

  private void restoreAttachedListenerSnapshot() {
    if (attachedListenersSnapshot == null) {
      resetListenerState();
      emitPrefersRestoredAttached = false;
      return;
    }
    jsListeners.clear();
    jsListeners.putAll(attachedListenersSnapshot);
    jsReady = attachedJsReadySnapshot;
    jsListenerCount = attachedJsListenerCountSnapshot;
    discardAttachedListenerSnapshot();
    emitPrefersRestoredAttached = true;
  }

  private void discardAttachedListenerSnapshot() {
    attachedListenersSnapshot = null;
    attachedJsReadySnapshot = false;
    attachedJsListenerCountSnapshot = 0;
  }

  private void clearConvergenceState() {
    pendingReactContext = new WeakReference<>(null);
    hostLagReactContext = new WeakReference<>(null);
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
    ReactContext fromReactHost = null;
    try {
      ReactHost reactHost = reactApplication.getReactHost();
      if (reactHost != null) {
        fromReactHost = reactHost.getCurrentReactContext();
        if (fromReactHost != null) {
          return fromReactHost;
        }
        // Hybrid / transitional hosts may expose a non-null ReactHost whose current context
        // is briefly null while the bridge ReactNativeHost still carries the live context.
        // Fall through rather than treating null as a permanent answer.
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
      // Bridgeless-only apps throw from getReactNativeHost(); if ReactHost was present but
      // returned null current, that null stands — still log so the failure is visible.
      Log.d(TAG, "Failed to resolve current ReactContext via ReactNativeHost", e);
    }

    return fromReactHost;
  }
}
