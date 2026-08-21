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

import org.reactivestreams.Subscription;

/**
 * Reservation stored before {@code publisher.subscribe} so JS {@code removeFunctionsStreaming}
 * cannot miss a cancel that races {@code onSubscribe}. Cancel is invoked on this object after take,
 * never under the HandleMap lock.
 */
final class StreamingHolder implements Subscription {
  private volatile Subscription inner;
  private volatile boolean cancelled;

  synchronized void attach(Subscription subscription) {
    inner = subscription;
    if (cancelled) {
      subscription.cancel();
    } else {
      subscription.request(Long.MAX_VALUE);
    }
  }

  @Override
  public void request(long n) {
    Subscription subscription = inner;
    if (subscription != null) {
      subscription.request(n);
    }
  }

  @Override
  public synchronized void cancel() {
    cancelled = true;
    Subscription subscription = inner;
    if (subscription != null) {
      subscription.cancel();
    }
  }
}
