package io.invertase.firebase.common

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

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.annotation.MainThread
import androidx.annotation.Nullable
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import io.invertase.firebase.app.ReactNativeFirebaseApp
import io.invertase.firebase.interfaces.NativeEvent
import java.lang.ref.WeakReference
import java.util.ArrayList
import java.util.HashMap

open class ReactNativeFirebaseEventEmitter {
  private val handler = Handler(Looper.getMainLooper())

  // All mutable state below is guarded by the jsListeners monitor. Attach/detach/ready
  // transitions happen synchronously at cause time under the same monitor as listener
  // registration: with more than one ReactContext generation alive during an instance
  // reload, deferring any of these transitions (e.g. to a congested main looper) reorders
  // them against a replacement runtime's synchronous registrations and can wipe or wedge
  // that runtime's state. Only queue flushing is posted to the main thread.
  private val queuedEvents: MutableList<NativeEvent> = ArrayList()
  private val jsListeners: HashMap<String?, Int> = HashMap()

  // Weak so the emitter never pins a dead ReactContext (and its module graph) for the
  // lifetime of the process if a runtime is torn down without a paired detach.
  private var attachedReactContext: WeakReference<ReactContext?> = WeakReference(null)

  // When the host still names a dying generation, a live module's attach is remembered here
  // and promoted once that dying context detaches or the host catches up — without waiting
  // solely on a later Activity resume that may never arrive.
  private var pendingReactContext: WeakReference<ReactContext?> = WeakReference(null)

  // Host identity we moved past while converging onto pending/attached; late attaches of this
  // identity must not displace the live generation while the host ref lags.
  private var hostLagReactContext: WeakReference<ReactContext?> = WeakReference(null)

  // When a new pending candidate enters while the attached generation still lives, listener
  // accounting is reset so events queue until the pending JS re-registers. Keep a snapshot of
  // the attached generation's accounting so a pending-only cancel can restore it — otherwise
  // the surviving attached runtime stays deaf for the rest of the session (#8374-class).
  @Nullable private var attachedListenersSnapshot: HashMap<String?, Int>? = null
  private var attachedJsReadySnapshot = false
  private var attachedJsListenerCountSnapshot = 0

  // After pending-only cancel restores that snapshot, emit must keep targeting the restored
  // attached generation even if the host has already advanced to an unrelated unattached
  // context — otherwise resolveEmitContext prefers raw hostCurrent and silently loses events
  // into a runtime with no RNFB JS subscribers (R1 class after cancel). Cleared when a new
  // generation attaches through acceptAttachedContext / convergence / full detach.
  private var emitPrefersRestoredAttached = false
  private var jsReady = false
  private var jsListenerCount = 0

  open fun attachReactContext(reactContext: ReactContext?) {
    // Resolve host current outside jsListeners so ReactApplication getters are not held
    // under the listener monitor (they are RN-owned and not expected to re-enter, but the
    // coupling is unnecessary for attach arbitration).
    val hostCurrent = getCurrentReactContextFromHost(reactContext)

    synchronized(jsListeners) {
      // Under the new architecture more than one ReactContext generation can exist while an
      // instance is destroyed and recreated: a module belonging to the dying generation may
      // run initialize() after the replacement generation has already attached (for example
      // TurboModuleManager creates requested-but-never-built modules during invalidate).
      // Attach is fail-closed when something is already attached: accept the candidate only
      // when the host currently names it. A null host current keeps the previous attachment
      // rather than accepting a late stale context. When the host still names the previous
      // (dying) context, remember the candidate as pending so detach/host catch-up can
      // converge without depending only on a later Activity resume.
      val previousContext = attachedReactContext.get()
      if (previousContext != null && previousContext !== reactContext) {
        if (hostCurrent == null) {
          Log.w(
            TAG,
            "Ignoring attach of ReactContext@" +
              System.identityHashCode(reactContext) +
              " while host current is null; keeping @" +
              System.identityHashCode(previousContext),
          )
          return
        }

        val hostLag = hostLagReactContext.get()
        if (hostCurrent === reactContext) {
          if (hostLag != null && hostLag === reactContext) {
            Log.w(
              TAG,
              "Ignoring attach of host-lag ReactContext@" +
                System.identityHashCode(reactContext) +
                "; keeping live @" +
                System.identityHashCode(previousContext),
            )
            return
          }
          acceptAttachedContext(
            reactContext,
            resetListenerState = pendingReactContext.get() !== reactContext,
          )
          clearConvergenceState()
          discardAttachedListenerSnapshot()
        } else if (hostCurrent === previousContext) {
          // Host still names the dying attached generation. Remember the candidate as pending
          // so detach/host catch-up can converge. Idempotent re-attach of the same pending
          // identity (e.g. async onHostResume while the host still lags) must not wipe
          // listeners the pending JS already registered. Reset only when entering pending for
          // a new candidate: first pending, or last-writer-wins replace of a different one.
          val existingPending = pendingReactContext.get()
          val newPendingCandidate = existingPending !== reactContext
          Log.i(
            TAG,
            "Host still on @" +
              System.identityHashCode(previousContext) +
              "; pending attach of @" +
              System.identityHashCode(reactContext) +
              (if (newPendingCandidate) "" else " (idempotent)"),
          )
          pendingReactContext = WeakReference(reactContext)
          hostLagReactContext = WeakReference(previousContext)
          if (newPendingCandidate) {
            // Drop previous-generation listener accounting; replacement JS will re-register.
            // Snapshot once per pending window so pending-only cancel can restore the
            // surviving attached generation (last-writer-wins replace keeps the first
            // snapshot — that is still the attached runtime's pre-pending state).
            snapshotAttachedListenerStateIfNeeded()
            resetListenerState()
          }
          handler.post { tryConvergePendingReactContext() }
          return
        } else {
          Log.w(
            TAG,
            "Ignoring attach of non-current ReactContext@" +
              System.identityHashCode(reactContext) +
              ", current is @" +
              System.identityHashCode(hostCurrent),
          )
          return
        }
      } else if (previousContext !== reactContext) {
        acceptAttachedContext(reactContext, resetListenerState = false)
        clearConvergenceState()
      } else {
        // Same context re-attach (e.g. resume). Clear lag only when this identity is the
        // live pending/attached generation the host has caught up to — not when we are
        // still the dying hostLag while a different pending replacement is waiting.
        if (hostCurrent === reactContext) {
          val pending = pendingReactContext.get()
          if (pending == null || pending === reactContext) {
            clearConvergenceState()
          }
        }
      }
    }

    handler.post { sendQueuedEvents() }
  }

  open fun detachReactContext(reactContext: ReactContext?) {
    synchronized(jsListeners) {
      // Pending-only invalidate (failed replacement startup / overlapping teardown): the
      // candidate never became attached, so cancel it before the attached-identity check.
      // Restore the surviving attached generation's listener / jsReady snapshot taken when
      // pending first entered — pending-window registrations belong to the cancelled
      // generation and must not leave the attached runtime deaf. Superseded identities that
      // are not the current pending fall through and no-op below — they must not wipe a
      // newer live pending's registrations.
      val pending = pendingReactContext.get()
      if (pending === reactContext && attachedReactContext.get() !== reactContext) {
        Log.i(
          TAG,
          "Cancelled pending ReactContext@" +
            System.identityHashCode(reactContext) +
            "; attached remains @" +
            System.identityHashCode(attachedReactContext.get()),
        )
        clearConvergenceState()
        restoreAttachedListenerSnapshot()
        // Events queued while the pending window wiped listeners must drain now — attached
        // JS already registered before pending entered and will not re-addListener.
        handler.post { sendQueuedEvents() }
        return
      }

      // Only clear state installed by the runtime that is going away; a dying generation
      // must not wipe listener registrations a replacement runtime has already made. A
      // replacement runtime always attaches (synchronously, at module creation) before its
      // JS can register listeners, so an identity match here means the dying state is ours.
      if (attachedReactContext.get() !== reactContext) {
        return
      }

      if (pending != null && pending !== reactContext) {
        Log.i(
          TAG,
          "Detached ReactContext@" +
            System.identityHashCode(reactContext) +
            "; promoting pending @" +
            System.identityHashCode(pending),
        )
        attachedReactContext = WeakReference(pending)
        pendingReactContext = WeakReference(null)
        // Keep jsReady / jsListeners: they belong to the promoted generation's JS.
        // hostLag stays set so emit and late attaches do not regress to the dying identity
        // while the host ref still names it.
        discardAttachedListenerSnapshot()
        emitPrefersRestoredAttached = false
        handler.post { sendQueuedEvents() }
        return
      }

      Log.i(TAG, "Detached ReactContext@" + System.identityHashCode(reactContext))
      attachedReactContext = WeakReference(null)
      resetListenerState()
      clearConvergenceState()
      discardAttachedListenerSnapshot()
      emitPrefersRestoredAttached = false
      // queuedEvents are intentionally kept: they drain once the next runtime attaches and
      // registers listeners, which is how events raised while no runtime is alive (for
      // example messaging events for a killed app) reach JS.
    }
  }

  open fun notifyJsReady(ready: Boolean?) {
    synchronized(jsListeners) {
      // Java assigns Boolean into primitive boolean — unbox at this assignment site.
      jsReady = nullableAsPlatformType(ready)
    }

    handler.post { sendQueuedEvents() }
  }

  open fun sendEvent(event: NativeEvent?) {
    handler.post {
      val nativeEvent: NativeEvent
      synchronized(jsListeners) {
        nativeEvent = nullableAsPlatformType(event)
        // First event dereference stays under the listener monitor, exactly as in Java.
        if (!jsListeners.containsKey(nativeEvent.getEventName())) {
          queuedEvents.add(nativeEvent)
          return@post
        }
      }
      // emit() resolves ReactApplication host current outside jsListeners; do not hold
      // the monitor across that call.
      if (!emit(nativeEvent)) {
        synchronized(jsListeners) {
          queuedEvents.add(nativeEvent)
        }
      }
    }
  }

  open fun addListener(eventName: String?) {
    synchronized(jsListeners) {
      jsListenerCount++
      if (!jsListeners.containsKey(eventName)) {
        jsListeners.put(eventName, 1)
      } else {
        val listenersForEvent: Int = nullableAsPlatformType(jsListeners[eventName])
        jsListeners.put(eventName, listenersForEvent + 1)
      }
    }

    handler.post { sendQueuedEvents() }
  }

  open fun removeListener(
    eventName: String?,
    all: Boolean?,
  ) {
    synchronized(jsListeners) {
      if (jsListeners.containsKey(eventName)) {
        val listenersForEvent: Int = nullableAsPlatformType(jsListeners[eventName])

        // Preserve Java short-circuit: unbox `all` only when count > 1.
        if (listenersForEvent <= 1 || nullableAsPlatformType(all)) {
          jsListeners.remove(eventName)
        } else {
          jsListeners.put(eventName, listenersForEvent - 1)
        }

        jsListenerCount -= if (nullableAsPlatformType(all)) listenersForEvent else 1
      }
    }
  }

  open val listenersMap: WritableMap
    get() {
      val writableMap = Arguments.createMap()
      val events = Arguments.createMap()

      // Resolve host current outside jsListeners; converge/snapshot under the monitor.
      val pendingHint: ReactContext?
      val attachedHint: ReactContext?
      synchronized(jsListeners) {
        pendingHint = pendingReactContext.get()
        attachedHint = attachedReactContext.get()
      }
      val hostForConverge =
        getCurrentReactContextFromHost(if (pendingHint != null) pendingHint else attachedHint)

      val attachedContext: ReactContext?
      synchronized(jsListeners) {
        tryConvergePendingReactContextLocked(hostForConverge)
        attachedContext = attachedReactContext.get()

        writableMap.putInt("listeners", jsListenerCount)
        writableMap.putInt("queued", queuedEvents.size)
        writableMap.putBoolean("jsReady", jsReady)
        writableMap.putInt(
          "attachedContextHash",
          if (attachedContext == null) 0 else System.identityHashCode(attachedContext),
        )

        for (entry in jsListeners.entries) {
          events.putInt(
            nullableAsPlatformType(entry.key),
            nullableAsPlatformType(entry.value),
          )
        }
      }

      val currentContext = getCurrentReactContextFromHost(attachedContext)
      writableMap.putInt(
        "currentContextHash",
        if (currentContext == null) 0 else System.identityHashCode(currentContext),
      )
      writableMap.putMap("events", events)

      return writableMap
    }

  @MainThread
  private fun sendQueuedEvents() {
    val toSend: MutableList<NativeEvent>
    synchronized(jsListeners) {
      toSend = ArrayList()
      for (event in ArrayList(queuedEvents)) {
        if (jsListeners.containsKey(event.getEventName())) {
          queuedEvents.remove(event)
          toSend.add(event)
        }
      }
    }
    for (event in toSend) {
      sendEvent(event)
    }
  }

  @MainThread
  private fun emit(event: NativeEvent): Boolean {
    // Snapshot readiness / pointers under the monitor, resolve host current outside (avoid
    // holding jsListeners across ReactApplication getters), then re-enter to converge/resolve.
    var attachedHint: ReactContext?
    val ready: Boolean
    synchronized(jsListeners) {
      ready = jsReady
      if (!ready) {
        return false
      }
      attachedHint = attachedReactContext.get()
      if (attachedHint == null) {
        attachedHint = pendingReactContext.get()
      }
    }
    val hostCurrent = getCurrentReactContextFromHost(attachedHint)

    val emitContext: ReactContext?
    synchronized(jsListeners) {
      if (!jsReady) {
        return false
      }
      tryConvergePendingReactContextLocked(hostCurrent)

      // Resolve the context hosting the live JS runtime at emit time rather than trusting the
      // attached one alone: a context captured at module-creation time can belong to a previous
      // generation whose runtime no longer contains the JS listeners, and on bridgeless a stale
      // context still reports an active instance so it cannot be validated - only replaced
      // (#8374, #8900). When attached has already converged ahead of a lagging host ref, prefer
      // attached over the dying host current so events are not delivered into a runtime with no
      // listeners.
      val attached = attachedReactContext.get()
      emitContext = resolveEmitContext(attached, hostCurrent)
    }

    if (emitContext == null) {
      return false
    }
    if (!emitContext.hasActiveReactInstance()) {
      return false
    }

    try {
      emitContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit("rnfb_" + event.getEventName(), event.getEventBody())
    } catch (e: Exception) {
      Log.wtf(TAG, "Error sending Event " + event.getEventName(), e)
      return false
    }

    return true
  }

  @Nullable
  private fun resolveEmitContext(
    @Nullable attached: ReactContext?,
    @Nullable hostCurrent: ReactContext?,
  ): ReactContext? {
    val pending = pendingReactContext.get()
    val hostLag = hostLagReactContext.get()

    // A pending replacement owns (or will own) the listener map. Prefer it over host/attached
    // for the whole pending window — including when the host has already advanced to an
    // unrelated third generation that has not yet attached via this emitter. Emitting into
    // that third context would return true with no RNFB JS subscribers and no re-queue.
    if (pending != null) {
      return pending
    }

    if (hostCurrent == null) {
      return attached
    }
    if (attached == null || attached === hostCurrent) {
      if (attached === hostCurrent) {
        clearConvergenceState()
        emitPrefersRestoredAttached = false
      }
      return hostCurrent
    }

    if (hostLag != null && hostLag === hostCurrent) {
      return attached
    }

    // Pending-only cancel restored listeners onto attached; an unrelated hostCurrent that has
    // not yet attached through this emitter must not steal delivery (silent loss, no re-queue).
    // Flag is only set while an attached generation still owns the restored map.
    if (emitPrefersRestoredAttached) {
      return attached
    }

    // Attached is stale relative to a host that has moved on — prefer the host.
    return hostCurrent
  }

  private fun tryConvergePendingReactContext() {
    val pendingHint: ReactContext?
    synchronized(jsListeners) {
      pendingHint = pendingReactContext.get()
    }
    if (pendingHint == null) {
      return
    }
    val hostCurrent = getCurrentReactContextFromHost(pendingHint)
    synchronized(jsListeners) {
      if (tryConvergePendingReactContextLocked(hostCurrent)) {
        handler.post { sendQueuedEvents() }
      }
    }
  }

  /**
   * Prefer resolving `hostCurrent` outside `jsListeners` and passing it in so ReactApplication
   * getters are not held under the listener monitor.
   *
   * @return true when attachment changed
   */
  private fun tryConvergePendingReactContextLocked(
    @Nullable hostCurrent: ReactContext?,
  ): Boolean {
    val pending = pendingReactContext.get()
    if (pending == null) {
      return false
    }
    if (hostCurrent !== pending) {
      return false
    }
    val previous = attachedReactContext.get()
    if (previous === pending) {
      clearConvergenceState()
      return false
    }
    Log.i(
      TAG,
      "Host caught up; attaching pending ReactContext@" + System.identityHashCode(pending),
    )
    acceptAttachedContext(pending, resetListenerState = false)
    clearConvergenceState()
    discardAttachedListenerSnapshot()
    return true
  }

  private fun acceptAttachedContext(
    reactContext: ReactContext?,
    resetListenerState: Boolean,
  ) {
    val previousContext = attachedReactContext.get()
    if (previousContext !== reactContext) {
      Log.i(
        TAG,
        "ReactContext changed: @" +
          System.identityHashCode(previousContext) +
          " -> @" +
          System.identityHashCode(reactContext),
      )
      attachedReactContext = WeakReference(reactContext)
      // A real attach of a new generation supersedes restored-attached emit affinity.
      emitPrefersRestoredAttached = false
      if (resetListenerState) {
        discardAttachedListenerSnapshot()
        resetListenerState()
      }
    }
  }

  private fun resetListenerState() {
    jsReady = false
    jsListeners.clear()
    jsListenerCount = 0
  }

  private fun snapshotAttachedListenerStateIfNeeded() {
    if (attachedListenersSnapshot != null) {
      return
    }
    attachedListenersSnapshot = HashMap(jsListeners)
    attachedJsReadySnapshot = jsReady
    attachedJsListenerCountSnapshot = jsListenerCount
  }

  private fun restoreAttachedListenerSnapshot() {
    val snapshot = attachedListenersSnapshot
    if (snapshot == null) {
      resetListenerState()
      emitPrefersRestoredAttached = false
      return
    }
    jsListeners.clear()
    jsListeners.putAll(snapshot)
    jsReady = attachedJsReadySnapshot
    jsListenerCount = attachedJsListenerCountSnapshot
    discardAttachedListenerSnapshot()
    emitPrefersRestoredAttached = true
  }

  private fun discardAttachedListenerSnapshot() {
    attachedListenersSnapshot = null
    attachedJsReadySnapshot = false
    attachedJsListenerCountSnapshot = 0
  }

  private fun clearConvergenceState() {
    pendingReactContext = WeakReference(null)
    hostLagReactContext = WeakReference(null)
  }

  @Suppress("UNCHECKED_CAST")
  private fun <T> nullableAsPlatformType(value: T?): T = value as T

  companion object {
    private const val TAG = "RNFB_EMITTER"

    // Kotlin emits this private companion property as a private static outer field.
    // @JvmStatic keeps getSharedInstance on the outer class with the original descriptor.
    private var sharedInstance: ReactNativeFirebaseEventEmitter = ReactNativeFirebaseEventEmitter()

    @JvmStatic
    fun getSharedInstance(): ReactNativeFirebaseEventEmitter = sharedInstance

    @JvmStatic
    @Nullable
    private fun getCurrentReactContextFromHost(
      @Nullable contextHint: ReactContext?,
    ): ReactContext? {
      var applicationContext: Context? =
        if (contextHint != null) {
          contextHint.applicationContext
        } else {
          ReactNativeFirebaseApp.getApplicationContext()
        }
      if (applicationContext != null) {
        // Normalize in case a non-application context (for example a ContentProvider context)
        // was stored as the fallback.
        applicationContext = applicationContext.applicationContext
      }
      if (applicationContext !is ReactApplication) {
        // Brownfield hosts that do not implement ReactApplication fall back to the attached
        // context, preserving pre-existing behaviour.
        return null
      }

      val reactApplication = applicationContext as ReactApplication

      // Note: these getters may lazily construct their host on first call; that is acceptable
      // here because a live react-native-firebase module implies the app's host already exists.
      var fromReactHost: ReactContext? = null
      try {
        val reactHost: ReactHost? = reactApplication.reactHost
        if (reactHost != null) {
          fromReactHost = reactHost.currentReactContext
          if (fromReactHost != null) {
            return fromReactHost
          }
          // Hybrid / transitional hosts may expose a non-null ReactHost whose current context
          // is briefly null while the bridge ReactNativeHost still carries the live context.
          // Fall through rather than treating null as a permanent answer.
        }
      } catch (e: RuntimeException) {
        // App-authored hosts may throw, and react-native 0.83+ throws from the deprecated
        // reactNativeHost getter on bridgeless-only apps.
        Log.d(TAG, "Failed to resolve current ReactContext via ReactHost", e)
      } catch (e: LinkageError) {
        Log.d(TAG, "Failed to resolve current ReactContext via ReactHost", e)
      }

      try {
        val reactNativeHost: ReactNativeHost? = reactApplication.reactNativeHost
        // hasInstance() guards against getReactInstanceManager() eagerly creating an instance
        // manager purely as a side effect of emitting an event.
        if (reactNativeHost != null && reactNativeHost.hasInstance()) {
          return reactNativeHost.reactInstanceManager.currentReactContext
        }
      } catch (e: RuntimeException) {
        // Bridgeless-only apps throw from getReactNativeHost(); if ReactHost was present but
        // returned null current, that null stands — still log so the failure is visible.
        Log.d(TAG, "Failed to resolve current ReactContext via ReactNativeHost", e)
      } catch (e: LinkageError) {
        Log.d(TAG, "Failed to resolve current ReactContext via ReactNativeHost", e)
      }

      return fromReactHost
    }
  }
}
