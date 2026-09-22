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

import com.facebook.react.bridge.WritableMap
import io.invertase.firebase.interfaces.NativeEvent
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertSame
import org.junit.Test
import org.mockito.Mockito.mock

class ReactNativeFirebaseEventTest {
  @Test
  fun twoArgumentConstructor_preservesValuesAndUsesNullAppName() {
    val body = mock(WritableMap::class.java)

    val event: NativeEvent = ReactNativeFirebaseEvent("event_name", body)

    assertEquals("event_name", event.eventName)
    assertSame(body, event.eventBody)
    assertNull(event.firebaseAppName)
  }

  @Test
  fun threeArgumentConstructor_preservesValues() {
    val body = mock(WritableMap::class.java)

    val event: NativeEvent = ReactNativeFirebaseEvent("event_name", body, "app_name")

    assertEquals("event_name", event.eventName)
    assertSame(body, event.eventBody)
    assertEquals("app_name", event.firebaseAppName)
  }

  @Test
  fun javaVisibleApi_hasBothConstructorShapesAndExactGetterTypes() {
    val eventClass = ReactNativeFirebaseEvent::class.java

    eventClass.getConstructor(String::class.java, WritableMap::class.java)
    eventClass.getConstructor(String::class.java, WritableMap::class.java, String::class.java)
    assertEquals(String::class.java, eventClass.getMethod("getEventName").returnType)
    assertEquals(WritableMap::class.java, eventClass.getMethod("getEventBody").returnType)
    assertEquals(String::class.java, eventClass.getMethod("getFirebaseAppName").returnType)
  }
}
