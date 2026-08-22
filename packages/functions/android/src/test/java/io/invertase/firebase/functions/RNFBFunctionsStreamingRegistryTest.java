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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import io.invertase.firebase.common.RNFBHandleCollisionException;
import org.junit.Test;
import org.reactivestreams.Subscription;

/**
 * JVM coverage for {@link RNFBFunctionsStreamingRegistry} + {@link StreamingHolder}. Does not
 * instantiate {@code NativeRNFBTurboFunctions} (React Native / Firebase) — D12.
 */
public class RNFBFunctionsStreamingRegistryTest {

  private static final class RecordingSubscription implements Subscription {
    int cancelCount;
    int requestCount;

    @Override
    public void request(long n) {
      requestCount++;
    }

    @Override
    public void cancel() {
      cancelCount++;
    }
  }

  @Test
  public void putOrCollisionMessage_uniqueId_putsHolder() {
    RNFBFunctionsStreamingRegistry registry = new RNFBFunctionsStreamingRegistry();
    StreamingHolder holder = new StreamingHolder();

    assertNull(registry.putOrCollisionMessage(1, holder));
    assertSame(holder, registry.get(1));
  }

  @Test
  public void putOrCollisionMessage_occupiedId_returnsMessage() throws Exception {
    RNFBFunctionsStreamingRegistry registry = new RNFBFunctionsStreamingRegistry();
    StreamingHolder first = new StreamingHolder();
    registry.put(1, first);

    String message = registry.putOrCollisionMessage(1, new StreamingHolder());

    assertTrue(message.contains("1"));
    assertSame(first, registry.get(1));
  }

  @Test
  public void attachOrCancel_whenRegistered_attachesUnbounded() throws Exception {
    RNFBFunctionsStreamingRegistry registry = new RNFBFunctionsStreamingRegistry();
    StreamingHolder holder = new StreamingHolder();
    registry.put(2, holder);
    RecordingSubscription inner = new RecordingSubscription();

    registry.attachOrCancel(2, inner);

    assertEquals(1, inner.requestCount);
    assertEquals(0, inner.cancelCount);
  }

  @Test
  public void attachOrCancel_whenTaken_cancelsSubscription() {
    RNFBFunctionsStreamingRegistry registry = new RNFBFunctionsStreamingRegistry();
    RecordingSubscription inner = new RecordingSubscription();

    registry.attachOrCancel(3, inner);

    assertEquals(1, inner.cancelCount);
    assertEquals(0, inner.requestCount);
  }

  @Test
  public void shouldEmit_whenPresent_isTrue() throws Exception {
    RNFBFunctionsStreamingRegistry registry = new RNFBFunctionsStreamingRegistry();
    registry.put(4, new StreamingHolder());
    assertTrue(registry.shouldEmit(4));
  }

  @Test
  public void shouldEmit_whenTaken_isFalse() {
    RNFBFunctionsStreamingRegistry registry = new RNFBFunctionsStreamingRegistry();
    assertFalse(registry.shouldEmit(4));
  }

  @Test
  public void takeAndShouldEmitComplete_whenHolderPresent_emitsAndClears() throws Exception {
    RNFBFunctionsStreamingRegistry registry = new RNFBFunctionsStreamingRegistry();
    registry.put(5, new StreamingHolder());

    assertTrue(registry.takeAndShouldEmitComplete(5));
    assertNull(registry.get(5));
  }

  @Test
  public void takeAndShouldEmitComplete_whenAlreadyTaken_skipsEmit() {
    RNFBFunctionsStreamingRegistry registry = new RNFBFunctionsStreamingRegistry();
    assertFalse(registry.takeAndShouldEmitComplete(5));
  }

  @Test
  public void onExecutorFailure_takesHolder() throws Exception {
    RNFBFunctionsStreamingRegistry registry = new RNFBFunctionsStreamingRegistry();
    registry.put(6, new StreamingHolder());

    registry.onExecutorFailure(6);

    assertNull(registry.get(6));
  }

  @Test
  public void takeAllAndCancel_cancelsHolders() throws Exception {
    RNFBFunctionsStreamingRegistry registry = new RNFBFunctionsStreamingRegistry();
    StreamingHolder holder = new StreamingHolder();
    RecordingSubscription inner = new RecordingSubscription();
    holder.attach(inner);
    holder.request(1);
    registry.put(7, holder);

    StreamingHolder other = new StreamingHolder();
    RecordingSubscription otherInner = new RecordingSubscription();
    other.attach(otherInner);
    registry.put(8, other);
    registry.takeAndCancel(8);

    registry.takeAllAndCancel();

    assertEquals(1, inner.cancelCount);
    assertEquals(2, inner.requestCount);
    assertEquals(1, otherInner.cancelCount);
    assertNull(registry.get(7));
    assertNull(registry.get(8));
  }

  @Test
  public void cancelBeforeOnSubscribe_cancelsInnerWithoutRequest() {
    StreamingHolder holder = new StreamingHolder();
    holder.request(1);
    holder.cancel();

    RecordingSubscription inner = new RecordingSubscription();
    holder.attach(inner);

    assertEquals(1, inner.cancelCount);
    assertEquals(0, inner.requestCount);
  }

  @Test
  public void put_occupiedId_throwsCollision() throws Exception {
    RNFBFunctionsStreamingRegistry registry = new RNFBFunctionsStreamingRegistry();
    StreamingHolder first = new StreamingHolder();
    registry.put(1, first);
    try {
      registry.put(1, new StreamingHolder());
      fail("expected RNFBHandleCollisionException");
    } catch (RNFBHandleCollisionException e) {
      assertTrue(e.getMessage().contains("1"));
      assertSame(first, registry.get(1));
    }
  }

  @Test
  public void put_afterTake_allowsReuse() throws Exception {
    RNFBFunctionsStreamingRegistry registry = new RNFBFunctionsStreamingRegistry();
    StreamingHolder first = new StreamingHolder();
    StreamingHolder second = new StreamingHolder();
    registry.put(1, first);
    assertSame(first, registry.take(1));
    registry.put(1, second);
    assertSame(second, registry.get(1));
  }

  @Test
  public void takeAndCancel_missingKey_isNoOp() {
    RNFBFunctionsStreamingRegistry registry = new RNFBFunctionsStreamingRegistry();
    registry.takeAndCancel(99);
    assertNull(registry.get(99));
  }

  @Test
  public void takeAllAndCancel_empty_isNoOp() {
    RNFBFunctionsStreamingRegistry registry = new RNFBFunctionsStreamingRegistry();
    registry.takeAllAndCancel();
    assertNull(registry.get(1));
  }

  @Test
  public void takeAllAndCancel_nullHolder_isNoOp() throws Exception {
    RNFBFunctionsStreamingRegistry registry = new RNFBFunctionsStreamingRegistry();
    registry.put(3, null);
    registry.takeAllAndCancel();
    assertNull(registry.get(3));
  }

  @Test
  public void attach_whenNotCancelled_requestsUnbounded() {
    StreamingHolder holder = new StreamingHolder();
    RecordingSubscription inner = new RecordingSubscription();
    holder.attach(inner);
    assertEquals(0, inner.cancelCount);
    assertEquals(1, inner.requestCount);
  }
}
