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
 */

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import io.invertase.firebase.interfaces.NativeEvent;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.HashMap;
import java.util.List;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.RobolectricTestRunner;

/**
 * Java ABI / nullability / descriptor checks for the Kotlin EventEmitter port.
 *
 * <p>Robolectric is required because companion initialization constructs a main-looper Handler.
 */
@RunWith(RobolectricTestRunner.class)
public class ReactNativeFirebaseEventEmitterJavaCompatibilityTest {

  @Test
  public void classIsPublicOpenConstructibleWithOuterStaticSharedInstanceAccessor()
      throws Exception {
    Class<?> emitterClass = ReactNativeFirebaseEventEmitter.class;
    assertTrue(Modifier.isPublic(emitterClass.getModifiers()));
    assertFalse(Modifier.isFinal(emitterClass.getModifiers()));

    Constructor<?> constructor = emitterClass.getDeclaredConstructor();
    assertTrue(Modifier.isPublic(constructor.getModifiers()));
    assertNotNull(constructor.newInstance());

    Method getSharedInstance = emitterClass.getMethod("getSharedInstance");
    assertTrue(Modifier.isPublic(getSharedInstance.getModifiers()));
    assertTrue(Modifier.isStatic(getSharedInstance.getModifiers()));
    assertEquals(emitterClass, getSharedInstance.getReturnType());
    assertSame(
        ReactNativeFirebaseEventEmitter.getSharedInstance(),
        ReactNativeFirebaseEventEmitter.getSharedInstance());
  }

  @Test
  public void publicMethodDescriptorsMatchJavaSurface() throws Exception {
    Class<?> emitterClass = ReactNativeFirebaseEventEmitter.class;

    assertPublicOpenInstance(
        emitterClass.getMethod("attachReactContext", ReactContext.class), Void.TYPE);
    assertPublicOpenInstance(
        emitterClass.getMethod("detachReactContext", ReactContext.class), Void.TYPE);
    assertPublicOpenInstance(emitterClass.getMethod("notifyJsReady", Boolean.class), Void.TYPE);
    assertPublicOpenInstance(emitterClass.getMethod("sendEvent", NativeEvent.class), Void.TYPE);
    assertPublicOpenInstance(emitterClass.getMethod("addListener", String.class), Void.TYPE);
    assertPublicOpenInstance(
        emitterClass.getMethod("removeListener", String.class, Boolean.class), Void.TYPE);
    assertPublicOpenInstance(emitterClass.getMethod("getListenersMap"), WritableMap.class);
  }

  @Test
  public void sharedInstanceRemainsPrivateStaticOuterField() throws Exception {
    Field shared = ReactNativeFirebaseEventEmitter.class.getDeclaredField("sharedInstance");
    assertTrue(Modifier.isPrivate(shared.getModifiers()));
    assertTrue(Modifier.isStatic(shared.getModifiers()));
    assertEquals(ReactNativeFirebaseEventEmitter.class, shared.getType());
  }

  @Test
  public void privateFieldNamesRemainReflectable() throws Exception {
    String[] names = {
      "handler",
      "queuedEvents",
      "jsListeners",
      "attachedReactContext",
      "pendingReactContext",
      "hostLagReactContext",
      "attachedListenersSnapshot",
      "attachedJsReadySnapshot",
      "attachedJsListenerCountSnapshot",
      "emitPrefersRestoredAttached",
      "jsReady",
      "jsListenerCount"
    };
    for (String name : names) {
      Field field = ReactNativeFirebaseEventEmitter.class.getDeclaredField(name);
      assertTrue(name, Modifier.isPrivate(field.getModifiers()));
    }

    // Java field type was List; Kotlin MutableList erases to List.
    Field queued = ReactNativeFirebaseEventEmitter.class.getDeclaredField("queuedEvents");
    assertEquals(List.class, queued.getType());
    Field listeners = ReactNativeFirebaseEventEmitter.class.getDeclaredField("jsListeners");
    assertEquals(HashMap.class, listeners.getType());
  }

  @Test
  public void hostResolveAndEmitMethodsRetainJavaDescriptors() throws Exception {
    Method resolve =
        ReactNativeFirebaseEventEmitter.class.getDeclaredMethod(
            "getCurrentReactContextFromHost", ReactContext.class);
    assertTrue(Modifier.isStatic(resolve.getModifiers()));
    assertTrue(Modifier.isPrivate(resolve.getModifiers()));
    assertEquals(ReactContext.class, resolve.getReturnType());

    Method emit =
        ReactNativeFirebaseEventEmitter.class.getDeclaredMethod("emit", NativeEvent.class);
    assertTrue(Modifier.isPrivate(emit.getModifiers()));
    assertEquals(Boolean.TYPE, emit.getReturnType());

    Method sendQueued = ReactNativeFirebaseEventEmitter.class.getDeclaredMethod("sendQueuedEvents");
    assertTrue(Modifier.isPrivate(sendQueued.getModifiers()));
    assertEquals(Void.TYPE, sendQueued.getReturnType());

    // androidx @Nullable/@MainThread are CLASS retention (lint-visible, not runtime).
    Field snapshot =
        ReactNativeFirebaseEventEmitter.class.getDeclaredField("attachedListenersSnapshot");
    assertTrue(Modifier.isPrivate(snapshot.getModifiers()));
    assertEquals(HashMap.class, snapshot.getType());
  }

  @Test
  public void notifyJsReadyNullUnboxesWithNpeAtAssignmentTiming() {
    ReactNativeFirebaseEventEmitter emitter = new ReactNativeFirebaseEventEmitter();
    try {
      emitter.notifyJsReady(null);
      fail("expected NullPointerException from Boolean unboxing");
    } catch (NullPointerException expected) {
      // Java assigned Boolean into primitive boolean inside the monitor.
    }
  }

  @Test
  public void removeListenerNullAllUnboxesOnlyWhenEventRegistered() {
    ReactNativeFirebaseEventEmitter emitter = new ReactNativeFirebaseEventEmitter();
    // No registration: null `all` must not unbox.
    emitter.removeListener("missing", null);

    emitter.addListener("present");
    try {
      emitter.removeListener("present", null);
      fail("expected NullPointerException from Boolean unboxing");
    } catch (NullPointerException expected) {
      // With count == 1, `|| all` short-circuits; `all ? … : 1` then unboxes.
    }
  }

  private static void assertPublicOpenInstance(Method method, Class<?> returnType) {
    assertTrue(method.toString(), Modifier.isPublic(method.getModifiers()));
    assertFalse(method.toString(), Modifier.isStatic(method.getModifiers()));
    assertFalse(method.toString(), Modifier.isFinal(method.getModifiers()));
    assertEquals(returnType, method.getReturnType());
  }
}
