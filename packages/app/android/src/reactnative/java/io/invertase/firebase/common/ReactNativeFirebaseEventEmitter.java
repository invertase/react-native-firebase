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

import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import androidx.annotation.MainThread;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import io.invertase.firebase.interfaces.NativeEvent;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class ReactNativeFirebaseEventEmitter {
  private static ReactNativeFirebaseEventEmitter sharedInstance =
      new ReactNativeFirebaseEventEmitter();
  private final List<NativeEvent> queuedEvents = new ArrayList<>();
  private final Handler handler = new Handler(Looper.getMainLooper());
  private final HashMap<String, Integer> jsListeners = new HashMap<>();
  private ReactContext reactContext;
  private Boolean jsReady = false;
  private int jsListenerCount;

  public static ReactNativeFirebaseEventEmitter getSharedInstance() {
    return sharedInstance;
  }

  public void attachReactContext(final ReactContext reactContext) {
    handler.post(
        () -> {
          ReactNativeFirebaseEventEmitter.this.reactContext = reactContext;
          sendQueuedEvents();
        });
  }

  public void notifyJsReady(Boolean ready) {
    handler.post(
        () -> {
          jsReady = ready;
          sendQueuedEvents();
        });
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

    writableMap.putInt("listeners", jsListenerCount);
    writableMap.putInt("queued", queuedEvents.size());

    synchronized (jsListeners) {
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
    if (!jsReady || reactContext == null || !reactContext.hasActiveCatalystInstance()) {
      return false;
    }

    try {
      reactContext
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
          .emit("rnfb_" + event.getEventName(), event.getEventBody());
    } catch (Exception e) {
      Log.wtf("RNFB_EMITTER", "Error sending Event " + event.getEventName(), e);
      return false;
    }

    return true;
  }
}
