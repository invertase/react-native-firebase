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
import android.support.annotation.MainThread;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import io.invertase.firebase.interfaces.NativeEvent;

public class ReactNativeFirebaseEventEmitter {
  private static ReactNativeFirebaseEventEmitter sharedInstance = new ReactNativeFirebaseEventEmitter();
  private final List<NativeEvent> queuedEvents = new ArrayList<>();
  private final Handler handler = new Handler(Looper.getMainLooper());
  private final Set<String> jsListeners = new HashSet<>();
  private ReactContext reactContext;
  private long jsListenerCount;

  public static ReactNativeFirebaseEventEmitter getSharedInstance() {
    return sharedInstance;
  }

  public void attachContext(final ReactContext reactContext) {
    handler.post(new Runnable() {
      @Override
      public void run() {
        ReactNativeFirebaseEventEmitter.this.reactContext = reactContext;
        sendQueuedEvents();
      }
    });
  }

  public void sendEvent(final NativeEvent event) {
    handler.post(new Runnable() {
      @Override
      public void run() {
        synchronized (jsListeners) {
          if (!jsListeners.contains(event.getEventName()) || !emit(event)) {
            queuedEvents.add(event);
          }
        }
      }
    });
  }

  public void addAndroidListener(String eventName) {
    synchronized (jsListeners) {
      jsListenerCount++;
      jsListeners.add(eventName);
    }

    handler.post(new Runnable() {
      @Override
      public void run() {
        sendQueuedEvents();
      }
    });
  }

  public void removeAndroidListeners(int count) {
    synchronized (jsListeners) {
      jsListenerCount -= count;
      if (jsListenerCount <= 0) {
        jsListenerCount = 0;
        jsListeners.clear();
      }
    }
  }

  @MainThread
  private void sendQueuedEvents() {
    synchronized (jsListeners) {
      for (NativeEvent event : new ArrayList<>(queuedEvents)) {
        if (jsListeners.contains(event.getEventName())) {
          queuedEvents.remove(event);
          sendEvent(event);
        }
      }
    }
  }

  @MainThread
  private boolean emit(final NativeEvent event) {
    if (reactContext == null || !reactContext.hasActiveCatalystInstance()) {
      return false;
    }

    try {
      reactContext.getJSModule(
        DeviceEventManagerModule.RCTDeviceEventEmitter.class
      ).emit(event.getEventName(), event.getEventBody());
    } catch (Exception e) {
      return false;
    }

    return true;
  }
}
