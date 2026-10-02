package io.invertase.firebase.functions

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

import io.invertase.firebase.common.RNFBHandleCollisionException
import io.invertase.firebase.common.RNFBHandleMap
import org.reactivestreams.Subscription
import java.util.function.Predicate

/**
 * Functions streaming listener map. Unique [put]; callers [take] or
 * [takeAllAndCancel] then cancel outside the HandleMap lock. Subscribe race is
 * [attachOrCancel]; emit-after-take checks are [shouldEmit] /
 * [takeAndShouldEmitComplete]. Terminal unregister is identity-gated to the known holder.
 */
internal class RNFBFunctionsStreamingRegistry {
  private val map = RNFBHandleMap<Int, StreamingHolder?>()

  @Throws(RNFBHandleCollisionException::class)
  fun put(
    listenerId: Int,
    holder: StreamingHolder?,
  ) {
    map.put(listenerId, holder)
  }

  /**
   * Unique put. On success returns `null`; on collision returns the HandleMap collision
   * message.
   */
  fun putOrCollisionMessage(
    listenerId: Int,
    holder: StreamingHolder?,
  ): String? {
    try {
      map.put(listenerId, holder)
      return null
    } catch (collision: RNFBHandleCollisionException) {
      return collision.message
    }
  }

  fun get(listenerId: Int): StreamingHolder? = map.get(listenerId)

  fun take(listenerId: Int): StreamingHolder? = map.take(listenerId)

  fun takeIf(
    listenerId: Int,
    shouldTake: Predicate<StreamingHolder?>,
  ): StreamingHolder? = map.takeIf(listenerId, shouldTake)

  /**
   * Attach [subscription] when the holder is still registered; otherwise cancel immediately
   * (JS remove raced `onSubscribe`).
   */
  fun attachOrCancel(
    listenerId: Int,
    subscription: Subscription,
  ) {
    val existing = map.get(listenerId)
    if (existing != null) {
      existing.attach(subscription)
    } else {
      subscription.cancel()
    }
  }

  /** `true` when a chunk may be emitted for this exact holder (still registered). */
  fun shouldEmit(
    listenerId: Int,
    holder: StreamingHolder?,
  ): Boolean = map.get(listenerId) === holder

  /**
   * Identity-gated take for stream completion. `true` when the complete event should be
   * emitted (this holder was still present).
   */
  fun takeAndShouldEmitComplete(
    listenerId: Int,
    holder: StreamingHolder?,
  ): Boolean = map.takeIf(listenerId) { h -> h === holder } != null

  /**
   * Drop this holder after setup failure on the executor (caller maps the cause to an RN error).
   */
  fun onExecutorFailure(
    listenerId: Int,
    holder: StreamingHolder?,
  ) {
    map.takeIf(listenerId) { h -> h === holder }
  }

  fun takeAndCancel(listenerId: Int) {
    val holder = map.take(listenerId)
    holder?.cancel()
  }

  fun takeAllAndCancel() {
    val remaining = map.takeAll()
    for (holder in remaining) {
      holder?.cancel()
    }
  }
}
