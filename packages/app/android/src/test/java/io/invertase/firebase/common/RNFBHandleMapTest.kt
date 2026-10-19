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

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Before
import org.junit.Test
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicReference

/**
 * JVM coverage for [RNFBHandleMap]. Tests must not invoke methods on stored values — the map only
 * moves pointers.
 */
class RNFBHandleMapTest {
  private lateinit var map: RNFBHandleMap<Int, Any>

  @Before
  fun setUp() {
    map = RNFBHandleMap()
  }

  @Test
  fun putGetTake_happyPath() {
    val handle = Any()
    map.put(1, handle)

    assertSame(handle, map.get(1))
    assertSame(handle, map.take(1))
    assertNull(map.get(1))
  }

  @Test
  fun take_missingKey_returnsNull() {
    assertNull(map.take(99))
    assertNull(map.get(99))
  }

  @Test
  fun takeAll_returnsSnapshotAndLeavesMapEmpty() {
    val a = Any()
    val b = Any()
    map.put(1, a)
    map.put(2, b)

    val snapshot = map.takeAll()

    assertEquals(2, snapshot.size)
    assertTrue(snapshot.contains(a))
    assertTrue(snapshot.contains(b))
    assertNull(map.get(1))
    assertNull(map.get(2))
    assertTrue(map.takeAll().isEmpty())
  }

  @Test
  fun put_occupiedId_throwsCollision() {
    val first = Any()
    map.put(1, first)
    try {
      map.put(1, Any())
      fail("expected RNFBHandleCollisionException")
    } catch (exception: RNFBHandleCollisionException) {
      assertTrue(exception.message!!.contains("1"))
      assertSame(first, map.get(1))
    }
  }

  @Test
  fun put_nullValue_stillTreatsIdAsOccupied() {
    val nullableMap = RNFBHandleMap<Int, Any?>()
    nullableMap.put(1, null)

    try {
      nullableMap.put(1, Any())
      fail("expected RNFBHandleCollisionException")
    } catch (exception: RNFBHandleCollisionException) {
      assertEquals("Handle id already registered: 1", exception.message)
      assertNull(nullableMap.get(1))
    }
  }

  @Test
  fun putIfAbsent_whenFree_storesAndReturnsTrue() {
    val handle = Any()
    assertTrue(map.putIfAbsent(1, handle))
    assertSame(handle, map.get(1))
  }

  @Test
  fun putIfAbsent_whenOccupied_keepsExistingAndReturnsFalse() {
    val first = Any()
    val second = Any()
    map.put(1, first)
    assertFalse(map.putIfAbsent(1, second))
    assertSame(first, map.get(1))
  }

  @Test
  fun putIfAbsent_nullableExistingValue_isOccupied() {
    val nullableMap = RNFBHandleMap<Int, Any?>()
    nullableMap.put(1, null)

    assertFalse(nullableMap.putIfAbsent(1, Any()))
    assertNull(nullableMap.get(1))
  }

  @Test
  fun putIfAbsentOrSame_whenAbsent_storesAndReturnsTrue() {
    val handle = Any()
    assertTrue(map.putIfAbsentOrSame(1, handle))
    assertSame(handle, map.get(1))
  }

  @Test
  fun putIfAbsentOrSame_whenSameInstance_returnsTrue() {
    val handle = Any()
    map.put(1, handle)
    assertTrue(map.putIfAbsentOrSame(1, handle))
    assertSame(handle, map.get(1))
  }

  @Test
  fun putIfAbsentOrSame_whenDifferent_returnsFalse() {
    val first = Any()
    val second = Any()
    map.put(1, first)
    assertFalse(map.putIfAbsentOrSame(1, second))
    assertSame(first, map.get(1))
  }

  @Test
  fun putIfAbsentOrSame_sameNullInstance_returnsTrue() {
    val nullableMap = RNFBHandleMap<Int, Any?>()
    nullableMap.put(1, null)

    assertTrue(nullableMap.putIfAbsentOrSame(1, null))
    assertNull(nullableMap.get(1))
  }

  @Test
  fun putIfAbsentOrSame_nullExistingAndDifferentHandle_returnsFalse() {
    val nullableMap = RNFBHandleMap<Int, Any?>()
    nullableMap.put(1, null)

    assertFalse(nullableMap.putIfAbsentOrSame(1, Any()))
    assertNull(nullableMap.get(1))
  }

  @Test
  fun putReplacing_whenFree_storesAndReturnsNull() {
    val handle = Any()
    assertNull(map.putReplacing(1, handle))
    assertSame(handle, map.get(1))
  }

  @Test
  fun putReplacing_whenOccupied_replacesLastWins() {
    val first = Any()
    val second = Any()
    map.put(1, first)
    assertSame(first, map.putReplacing(1, second))
    assertSame(second, map.get(1))
  }

  @Test
  fun put_afterTake_allowsReuse() {
    val first = Any()
    val second = Any()
    map.put(1, first)
    assertSame(first, map.take(1))
    map.put(1, second)
    assertSame(second, map.get(1))
  }

  @Test
  fun takeIf_whenPredicateTrue_removesAndReturns() {
    val handle = Any()
    map.put(1, handle)
    assertSame(handle, map.takeIf(1) { it === handle })
    assertNull(map.get(1))
  }

  @Test
  fun takeIf_whenPredicateFalse_leavesMapping() {
    val handle = Any()
    map.put(1, handle)
    assertNull(map.takeIf(1) { false })
    assertSame(handle, map.get(1))
  }

  @Test
  fun takeIf_whenMissing_returnsNull() {
    assertNull(map.takeIf(99) { true })
  }

  @Test
  fun take_sameIdFromTwoThreads_onlyOneReturnsNonNull() {
    val handle = Any()
    map.put(1, handle)

    val start = CountDownLatch(1)
    val done = CountDownLatch(2)
    val first = AtomicReference<Any>()
    val second = AtomicReference<Any>()

    val firstThread =
      Thread {
        try {
          start.await()
          first.set(map.take(1))
        } catch (_: InterruptedException) {
          Thread.currentThread().interrupt()
        } finally {
          done.countDown()
        }
      }
    val secondThread =
      Thread {
        try {
          start.await()
          second.set(map.take(1))
        } catch (_: InterruptedException) {
          Thread.currentThread().interrupt()
        } finally {
          done.countDown()
        }
      }

    firstThread.start()
    secondThread.start()
    start.countDown()
    assertTrue(done.await(5, TimeUnit.SECONDS))

    val a = first.get()
    val b = second.get()
    val onlyFirst = a === handle && b == null
    val onlySecond = b === handle && a == null
    assertTrue(onlyFirst || onlySecond)
    assertNull(map.get(1))
  }

  @Test
  fun putReplacing_sameIdFromTwoThreads_lastWins() {
    val first = Any()
    val second = Any()
    val third = Any()
    map.put(1, first)

    val start = CountDownLatch(1)
    val done = CountDownLatch(2)
    val previousA = AtomicReference<Any>()
    val previousB = AtomicReference<Any>()

    val firstThread =
      Thread {
        try {
          start.await()
          previousA.set(map.putReplacing(1, second))
        } catch (_: InterruptedException) {
          Thread.currentThread().interrupt()
        } finally {
          done.countDown()
        }
      }
    val secondThread =
      Thread {
        try {
          start.await()
          previousB.set(map.putReplacing(1, third))
        } catch (_: InterruptedException) {
          Thread.currentThread().interrupt()
        } finally {
          done.countDown()
        }
      }

    firstThread.start()
    secondThread.start()
    start.countDown()
    assertTrue(done.await(5, TimeUnit.SECONDS))

    val winner = map.get(1)
    assertTrue(winner === second || winner === third)
    val returnedFirst = if (previousA.get() === first) previousA.get() else previousB.get()
    assertSame(first, returnedFirst)
  }
}
