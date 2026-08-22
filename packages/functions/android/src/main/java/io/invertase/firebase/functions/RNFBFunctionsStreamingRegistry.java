package io.invertase.firebase.functions;

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

import io.invertase.firebase.common.RNFBHandleCollisionException;
import io.invertase.firebase.common.RNFBHandleMap;
import java.util.List;
import org.reactivestreams.Subscription;

/**
 * Functions streaming listener map. Unique {@link #put}; callers {@link #take} or {@link
 * #takeAllAndCancel} then cancel outside the HandleMap lock. Subscribe race is {@link
 * #attachOrCancel}; emit-after-take checks are {@link #shouldEmit} / {@link
 * #takeAndShouldEmitComplete}.
 */
final class RNFBFunctionsStreamingRegistry {
  private final RNFBHandleMap<Integer, StreamingHolder> map = new RNFBHandleMap<>();

  void put(int listenerId, StreamingHolder holder) throws RNFBHandleCollisionException {
    map.put(listenerId, holder);
  }

  /**
   * Unique put. On success returns {@code null}; on collision returns the HandleMap collision
   * message.
   */
  String putOrCollisionMessage(int listenerId, StreamingHolder holder) {
    try {
      map.put(listenerId, holder);
      return null;
    } catch (RNFBHandleCollisionException collision) {
      return collision.getMessage();
    }
  }

  StreamingHolder get(int listenerId) {
    return map.get(listenerId);
  }

  StreamingHolder take(int listenerId) {
    return map.take(listenerId);
  }

  /**
   * Attach {@code subscription} when the holder is still registered; otherwise cancel immediately
   * (JS remove raced {@code onSubscribe}).
   */
  void attachOrCancel(int listenerId, Subscription subscription) {
    StreamingHolder existing = map.get(listenerId);
    if (existing != null) {
      existing.attach(subscription);
    } else {
      subscription.cancel();
    }
  }

  /** {@code true} when a chunk may be emitted (holder still registered). */
  boolean shouldEmit(int listenerId) {
    return map.get(listenerId) != null;
  }

  /**
   * Take the holder for stream completion. {@code true} when the complete event should be emitted
   * (holder was still present).
   */
  boolean takeAndShouldEmitComplete(int listenerId) {
    return map.take(listenerId) != null;
  }

  /** Drop the holder after setup failure on the executor (caller maps the cause to an RN error). */
  void onExecutorFailure(int listenerId) {
    map.take(listenerId);
  }

  void takeAndCancel(int listenerId) {
    StreamingHolder holder = map.take(listenerId);
    if (holder != null) {
      holder.cancel();
    }
  }

  void takeAllAndCancel() {
    List<StreamingHolder> remaining = map.takeAll();
    for (StreamingHolder holder : remaining) {
      if (holder != null) {
        holder.cancel();
      }
    }
  }
}
