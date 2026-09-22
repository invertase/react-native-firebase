package io.invertase.firebase.interfaces

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

import com.facebook.react.bridge.WritableMap
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.lang.reflect.Modifier

class NativeEventTest {
  @Test
  fun javaVisibleApi_hasExactAbstractGetterSignatures() {
    val methods = NativeEvent::class.java.declaredMethods.associateBy { it.name }

    assertEquals(setOf("getEventName", "getEventBody", "getFirebaseAppName"), methods.keys)
    assertEquals(String::class.java, methods.getValue("getEventName").returnType)
    assertEquals(WritableMap::class.java, methods.getValue("getEventBody").returnType)
    assertEquals(String::class.java, methods.getValue("getFirebaseAppName").returnType)
    methods.values.forEach { method ->
      assertEquals(0, method.parameterCount)
      assertTrue(Modifier.isAbstract(method.modifiers))
    }
  }

  @Test
  fun firebaseAppName_isNullableInKotlin() {
    val event =
      object : NativeEvent {
        override fun getEventName(): String = "event_name"

        override fun getEventBody(): WritableMap = error("Not used")

        override fun getFirebaseAppName(): String? = null
      }
    val firebaseAppName: String? = event.getFirebaseAppName()

    assertNull(firebaseAppName)
  }
}
