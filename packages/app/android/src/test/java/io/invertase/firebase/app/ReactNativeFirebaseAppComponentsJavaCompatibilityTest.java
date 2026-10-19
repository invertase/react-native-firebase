package com.google.firebase.platforminfo;

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
import static org.junit.Assert.assertTrue;

import com.google.firebase.components.Component;
import com.google.firebase.components.ComponentRegistrar;
import io.invertase.firebase.app.ReactNativeFirebaseAppInitProvider;
import io.invertase.firebase.app.ReactNativeFirebaseAppRegistrar;
import io.invertase.firebase.app.ReactNativeFirebaseVersion;
import io.invertase.firebase.common.ReactNativeFirebaseInitProvider;
import java.lang.reflect.Constructor;
import java.lang.reflect.Modifier;
import java.util.List;
import org.junit.Test;

public class ReactNativeFirebaseAppComponentsJavaCompatibilityTest {
  @Test
  public void initProviderPreservesManifestReflectionAbi() throws Exception {
    Class<ReactNativeFirebaseAppInitProvider> providerClass =
        ReactNativeFirebaseAppInitProvider.class;

    assertTrue(Modifier.isPublic(providerClass.getModifiers()));
    assertFalse(Modifier.isFinal(providerClass.getModifiers()));
    assertEquals(ReactNativeFirebaseInitProvider.class, providerClass.getSuperclass());

    Constructor<ReactNativeFirebaseAppInitProvider> constructor =
        providerClass.getDeclaredConstructor();
    assertTrue(Modifier.isPublic(constructor.getModifiers()));
    assertEquals(providerClass, constructor.newInstance().getClass());
  }

  @Test
  public void registrarPreservesReflectionAndJavaGenericAbi() throws Exception {
    Class<ReactNativeFirebaseAppRegistrar> registrarClass = ReactNativeFirebaseAppRegistrar.class;

    assertTrue(Modifier.isPublic(registrarClass.getModifiers()));
    assertFalse(Modifier.isFinal(registrarClass.getModifiers()));
    assertTrue(ComponentRegistrar.class.isAssignableFrom(registrarClass));

    Constructor<ReactNativeFirebaseAppRegistrar> constructor =
        registrarClass.getDeclaredConstructor();
    assertTrue(Modifier.isPublic(constructor.getModifiers()));

    ReactNativeFirebaseAppRegistrar registrar = constructor.newInstance();
    List<Component<?>> components = registrar.getComponents();
    assertEquals(1, components.size());

    LibraryVersion version = (LibraryVersion) components.get(0).getFactory().create(null);
    assertEquals("react-native-firebase", version.getLibraryName());
    assertEquals(ReactNativeFirebaseVersion.VERSION, version.getVersion());
  }
}
