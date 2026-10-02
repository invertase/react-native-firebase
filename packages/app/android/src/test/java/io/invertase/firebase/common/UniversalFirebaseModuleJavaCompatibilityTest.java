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
import static org.junit.Assert.assertNotSame;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertThrows;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import android.content.Context;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import javax.annotation.OverridingMethodsMustInvokeSuper;
import org.json.JSONObject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

/** Verifies the Kotlin port remains source- and binary-compatible with Java callers. */
public class UniversalFirebaseModuleJavaCompatibilityTest {
  private Field jsonObjectField;
  private Object originalJsonObject;

  @Before
  public void setUp() throws Exception {
    ReactNativeFirebaseJSON json = ReactNativeFirebaseJSON.getSharedInstance();
    jsonObjectField = ReactNativeFirebaseJSON.class.getDeclaredField("jsonObject");
    jsonObjectField.setAccessible(true);
    originalJsonObject = jsonObjectField.get(json);
    jsonObjectField.set(json, mock(JSONObject.class));
  }

  @After
  public void tearDown() throws Exception {
    jsonObjectField.set(ReactNativeFirebaseJSON.getSharedInstance(), originalJsonObject);
  }

  @Test
  public void preservesPublicOpenJavaAbi() throws Exception {
    Class<UniversalFirebaseModule> type = UniversalFirebaseModule.class;
    Constructor<UniversalFirebaseModule> constructor =
        type.getConstructor(Context.class, String.class);

    assertTrue(Modifier.isPublic(type.getModifiers()));
    assertFalse(Modifier.isFinal(type.getModifiers()));
    assertTrue(Modifier.isPublic(constructor.getModifiers()));

    for (String methodName :
        Arrays.asList(
            "getContext",
            "getApplicationContext",
            "getExecutor",
            "getName",
            "onTearDown",
            "getConstants")) {
      Method method = type.getDeclaredMethod(methodName);
      assertTrue(methodName, Modifier.isPublic(method.getModifiers()));
      assertFalse(methodName, Modifier.isFinal(method.getModifiers()));
    }

    assertEquals(Context.class, type.getDeclaredMethod("getContext").getReturnType());
    assertEquals(Context.class, type.getDeclaredMethod("getApplicationContext").getReturnType());
    assertEquals(ExecutorService.class, type.getDeclaredMethod("getExecutor").getReturnType());
    assertEquals(String.class, type.getDeclaredMethod("getName").getReturnType());
    assertEquals(void.class, type.getDeclaredMethod("onTearDown").getReturnType());
    assertEquals(Map.class, type.getDeclaredMethod("getConstants").getReturnType());
    assertTrue(
        type.getDeclaredMethod("onTearDown")
            .isAnnotationPresent(OverridingMethodsMustInvokeSuper.class));
  }

  @Test
  public void preservesNullPermissivenessNameAndContextBehavior() {
    UniversalFirebaseModule nullModule = new UniversalFirebaseModule(null, null);

    assertNull(nullModule.getContext());
    assertEquals("UniversalnullModule", nullModule.getName());
    assertThrows(NullPointerException.class, nullModule::getApplicationContext);
    nullModule.onTearDown();

    Context context = mock(Context.class);
    Context applicationContext = mock(Context.class);
    when(context.getApplicationContext()).thenReturn(applicationContext);
    UniversalFirebaseModule module = new UniversalFirebaseModule(context, "App");

    assertSame(context, module.getContext());
    assertSame(applicationContext, module.getApplicationContext());
    assertEquals("UniversalAppModule", module.getName());
    module.onTearDown();

    Context contextWithNoApplicationContext = mock(Context.class);
    UniversalFirebaseModule nullApplicationContextModule =
        new UniversalFirebaseModule(contextWithNoApplicationContext, "NullApplicationContext");
    assertNull(nullApplicationContextModule.getApplicationContext());
    nullApplicationContextModule.onTearDown();
  }

  @Test
  public void constructorUsesVirtualGetNameDuringSuperConstruction() throws Exception {
    ConstructorDispatchModule module = new ConstructorDispatchModule(null, "Ignored");
    Field executorServiceField = UniversalFirebaseModule.class.getDeclaredField("executorService");
    executorServiceField.setAccessible(true);
    Object executorService = executorServiceField.get(module);
    Field nameField = TaskExecutorService.class.getDeclaredField("name");
    nameField.setAccessible(true);

    assertEquals("DuringSuper", nameField.get(executorService));
    assertEquals("AfterSuper", module.getName());
    module.onTearDown();
  }

  @Test
  public void exposesExecutorAndTearDownShutsItDown() {
    UniversalFirebaseModule module = new UniversalFirebaseModule(null, "Shutdown");
    ExecutorService executor = module.getExecutor();

    assertSame(executor, module.getExecutor());
    assertFalse(executor.isShutdown());

    module.onTearDown();

    assertTrue(executor.isShutdown());
  }

  @Test
  public void constantsAreFreshMutableHashMaps() {
    UniversalFirebaseModule module = new UniversalFirebaseModule(null, "Constants");
    Map<String, Object> first = module.getConstants();
    Map<String, Object> second = module.getConstants();

    assertTrue(first instanceof HashMap);
    assertTrue(second instanceof HashMap);
    assertNotSame(first, second);
    first.put("mutable", true);
    assertEquals(true, first.get("mutable"));
    assertTrue(second.isEmpty());
    module.onTearDown();
  }

  private static final class ConstructorDispatchModule extends UniversalFirebaseModule {
    private String state;

    ConstructorDispatchModule(Context context, String serviceName) {
      super(context, serviceName);
      state = "AfterSuper";
    }

    @Override
    public String getName() {
      return state == null ? "DuringSuper" : state;
    }
  }
}
