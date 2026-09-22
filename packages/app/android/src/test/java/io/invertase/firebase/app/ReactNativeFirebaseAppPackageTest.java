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
 */

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import android.content.Context;
import android.util.Log;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import io.invertase.firebase.utils.NativeRNFBTurboUtils;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.Nonnull;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.mockito.MockedStatic;

/**
 * Verifies behavior and Java ABI remain stable while the package implementation moves to Kotlin.
 */
public class ReactNativeFirebaseAppPackageTest {
  private Field applicationContextField;
  private Context originalApplicationContext;
  private MockedStatic<Log> log;

  @Before
  public void setUp() throws Exception {
    applicationContextField = ReactNativeFirebaseApp.class.getDeclaredField("applicationContext");
    applicationContextField.setAccessible(true);
    originalApplicationContext = (Context) applicationContextField.get(null);
    applicationContextField.set(null, null);
    log = org.mockito.Mockito.mockStatic(Log.class);
  }

  @After
  public void tearDown() throws Exception {
    applicationContextField.set(null, originalApplicationContext);
    log.close();
  }

  @Test
  public void createNativeModules_setsMissingApplicationContextAndReturnsMutableOrderedArrayList() {
    ReactApplicationContext reactContext = mock(ReactApplicationContext.class);
    Context applicationContext = mock(Context.class);
    when(reactContext.getApplicationContext()).thenReturn(applicationContext);

    List<NativeModule> modules =
        new ReactNativeFirebaseAppPackage().createNativeModules(reactContext);

    assertSame(applicationContext, ReactNativeFirebaseApp.getApplicationContext());
    assertTrue(modules instanceof ArrayList);
    assertEquals(2, modules.size());
    assertEquals(NativeRNFBTurboApp.class, modules.get(0).getClass());
    assertEquals(NativeRNFBTurboUtils.class, modules.get(1).getClass());
    modules.clear();
    assertTrue(modules.isEmpty());
  }

  @Test
  public void createNativeModules_preservesExistingApplicationContext() throws Exception {
    Context existingApplicationContext = mock(Context.class);
    applicationContextField.set(null, existingApplicationContext);
    ReactApplicationContext reactContext = mock(ReactApplicationContext.class);

    List<NativeModule> modules =
        new ReactNativeFirebaseAppPackage().createNativeModules(reactContext);

    assertSame(existingApplicationContext, ReactNativeFirebaseApp.getApplicationContext());
    verify(reactContext, never()).getApplicationContext();
    assertEquals(NativeRNFBTurboApp.class, modules.get(0).getClass());
    assertEquals(NativeRNFBTurboUtils.class, modules.get(1).getClass());
  }

  @Test
  public void createViewManagers_returnsEmptyList() {
    ReactNativeFirebaseAppPackage subject = new ReactNativeFirebaseAppPackage();
    ReactApplicationContext reactContext = mock(ReactApplicationContext.class);

    List<ViewManager> viewManagers = subject.createViewManagers(reactContext);

    assertTrue(viewManagers.isEmpty());
  }

  @Test
  public void preservesPublicOpenNoArgJavaAbiAndNonnullGenericContracts() throws Exception {
    Class<ReactNativeFirebaseAppPackage> type = ReactNativeFirebaseAppPackage.class;
    Constructor<ReactNativeFirebaseAppPackage> constructor = type.getConstructor();

    assertTrue(Modifier.isPublic(type.getModifiers()));
    assertFalse(Modifier.isFinal(type.getModifiers()));
    assertTrue(Modifier.isPublic(constructor.getModifiers()));

    assertPackageMethodAbi(
        type.getDeclaredMethod("createNativeModules", ReactApplicationContext.class),
        NativeModule.class);
    assertPackageMethodAbi(
        type.getDeclaredMethod("createViewManagers", ReactApplicationContext.class),
        ViewManager.class);

    ReactNativeFirebaseAppPackage subclass =
        new ReactNativeFirebaseAppPackage() {
          @Override
          public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
            return new ArrayList<>();
          }

          @Override
          public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
            return new ArrayList<>();
          }
        };
    assertTrue(subclass.createNativeModules(mock(ReactApplicationContext.class)).isEmpty());
    assertTrue(subclass.createViewManagers(mock(ReactApplicationContext.class)).isEmpty());
    assertNull(subclass.getModule("missing", mock(ReactApplicationContext.class)));
  }

  private static void assertPackageMethodAbi(Method method, Class<?> genericElementType) {
    assertTrue(Modifier.isPublic(method.getModifiers()));
    assertFalse(Modifier.isFinal(method.getModifiers()));
    assertEquals(List.class, method.getReturnType());
    assertTrue(method.isAnnotationPresent(Nonnull.class));
    assertTrue(method.getParameters()[0].isAnnotationPresent(Nonnull.class));

    ParameterizedType genericReturnType = (ParameterizedType) method.getGenericReturnType();
    assertEquals(List.class, genericReturnType.getRawType());
    Type[] arguments = genericReturnType.getActualTypeArguments();
    assertEquals(1, arguments.length);
    Type elementType = arguments[0];
    if (elementType instanceof ParameterizedType) {
      elementType = ((ParameterizedType) elementType).getRawType();
    }
    assertEquals(genericElementType, elementType);
  }
}
