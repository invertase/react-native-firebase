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
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertSame;

import com.google.firebase.FirebaseNetworkException;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.functions.FirebaseFunctionsException;
import java.io.IOException;
import java.net.SocketTimeoutException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.RobolectricTestRunner;

/**
 * JVM coverage for {@link RNFBFunctionsError}. Auth failures are wrapped the way the SDK delivers
 * them: {@code Tasks.await}'s {@code ExecutionException} around {@code Tasks.whenAll}'s {@code
 * ExecutionException} for calls, and a {@code FirebaseFunctionsException} INTERNAL around the same
 * {@code whenAll} failure for streams. Robolectric supplies the Android classes the Firebase
 * exceptions use ({@code TextUtils}, and {@code SparseArray} in {@code
 * FirebaseFunctionsException.Code}).
 */
@RunWith(RobolectricTestRunner.class)
public class RNFBFunctionsErrorTest {

  private static final String DOMAIN = RNFBFunctionsError.DOMAIN_KEY;
  private static final String NATIVE_CODE = RNFBFunctionsError.NATIVE_CODE_KEY;

  private static Exception asCallFailure(Exception tokenFailure) {
    return new ExecutionException(
        new ExecutionException("1 out of 2 underlying tasks failed", tokenFailure));
  }

  private static Exception asStreamFailure(Exception tokenFailure) {
    return new FirebaseFunctionsException(
        "Error retrieving context",
        FirebaseFunctionsException.Code.INTERNAL,
        null,
        new ExecutionException("1 out of 2 underlying tasks failed", tokenFailure));
  }

  private static Map<?, ?> detailsOf(RNFBFunctionsError error) {
    return (Map<?, ?>) error.details;
  }

  // Auth ID token fetch failures

  @Test
  public void authNetworkError_onCall_isUnavailable() {
    RNFBFunctionsError error =
        RNFBFunctionsError.from(asCallFailure(new FirebaseNetworkException("network down")));

    assertEquals("UNAVAILABLE", error.code);
    assertEquals("network down", error.message);
    assertEquals("com.google.firebase.FirebaseNetworkException", detailsOf(error).get(DOMAIN));
    assertNull(detailsOf(error).get(NATIVE_CODE));
    assertEquals(2, detailsOf(error).size());
  }

  @Test
  public void authNetworkError_onStream_isUnavailable() {
    RNFBFunctionsError error =
        RNFBFunctionsError.from(asStreamFailure(new FirebaseNetworkException("network down")));

    assertEquals("UNAVAILABLE", error.code);
    assertEquals("network down", error.message);
  }

  @Test
  public void authNetworkError_asTheThrowable_isUnavailable() {
    RNFBFunctionsError error = RNFBFunctionsError.from(new FirebaseNetworkException("offline"));

    assertEquals("UNAVAILABLE", error.code);
    assertEquals("offline", error.message);
  }

  @Test
  public void deadCredential_onCall_isUnauthenticated() {
    String[] deadCredentialCodes = {
      "ERROR_USER_DISABLED",
      "ERROR_USER_NOT_FOUND",
      "ERROR_INVALID_USER_TOKEN",
      "ERROR_USER_TOKEN_EXPIRED",
    };
    for (String authCode : deadCredentialCodes) {
      RNFBFunctionsError error =
          RNFBFunctionsError.from(asCallFailure(new FirebaseAuthException(authCode, "gone")));

      assertEquals(authCode, "UNAUTHENTICATED", error.code);
      assertEquals(authCode, "gone", error.message);
      assertEquals(
          authCode, "com.google.firebase.auth.FirebaseAuthException", detailsOf(error).get(DOMAIN));
      assertEquals(authCode, authCode, detailsOf(error).get(NATIVE_CODE));
    }
  }

  @Test
  public void deadCredential_onStream_isUnauthenticated() {
    RNFBFunctionsError error =
        RNFBFunctionsError.from(
            asStreamFailure(new FirebaseAuthException("ERROR_USER_DISABLED", "disabled")));

    assertEquals("UNAUTHENTICATED", error.code);
    assertEquals("disabled", error.message);
    assertEquals("ERROR_USER_DISABLED", detailsOf(error).get(NATIVE_CODE));
  }

  @Test
  public void otherAuthError_onCall_staysUnknown() {
    Exception failure =
        asCallFailure(new FirebaseAuthException("ERROR_INTERNAL_ERROR", "internal"));

    RNFBFunctionsError error = RNFBFunctionsError.from(failure);

    assertEquals("UNKNOWN", error.code);
    assertEquals(failure.getMessage(), error.message);
    assertNull(error.details);
  }

  @Test
  public void otherAuthError_onStream_staysInternal() {
    RNFBFunctionsError error =
        RNFBFunctionsError.from(
            asStreamFailure(new FirebaseAuthException("ERROR_INTERNAL_ERROR", "internal")));

    assertEquals("INTERNAL", error.code);
    assertEquals("Error retrieving context", error.message);
    assertNull(error.details);
  }

  @Test
  public void cyclicCauseChain_withoutAuthFailure_terminatesAsUnknown() {
    Exception first = new Exception("first");
    Exception second = new Exception("second", first);
    first.initCause(second);

    RNFBFunctionsError error = RNFBFunctionsError.from(first);

    assertEquals("UNKNOWN", error.code);
    assertEquals("first", error.message);
  }

  // FirebaseFunctionsException and other failures

  @Test
  public void functionsException_asCause_passesThrough() {
    Object details = "detail";
    FirebaseFunctionsException functionsException =
        new FirebaseFunctionsException(
            "not found", FirebaseFunctionsException.Code.NOT_FOUND, details);

    RNFBFunctionsError error = RNFBFunctionsError.from(new ExecutionException(functionsException));

    assertEquals("NOT_FOUND", error.code);
    assertEquals("not found", error.message);
    assertSame(details, error.details);
  }

  @Test
  public void functionsException_streamingStatusDetails_overrideCodeAndMessage() {
    Map<String, Object> details = new HashMap<>();
    details.put("status", "PERMISSION_DENIED");
    details.put("message", "denied by server");

    RNFBFunctionsError error =
        RNFBFunctionsError.from(
            new FirebaseFunctionsException(
                "internal", FirebaseFunctionsException.Code.INTERNAL, details));

    assertEquals("PERMISSION_DENIED", error.code);
    assertEquals("denied by server", error.message);
    assertSame(details, error.details);
  }

  @Test
  public void functionsException_detailsWithoutStringStatusOrMessage_keepCodeAndMessage() {
    Map<String, Object> details = new HashMap<>();
    details.put("status", 7);

    RNFBFunctionsError error =
        RNFBFunctionsError.from(
            new FirebaseFunctionsException(
                "denied", FirebaseFunctionsException.Code.PERMISSION_DENIED, details));

    assertEquals("PERMISSION_DENIED", error.code);
    assertEquals("denied", error.message);
    assertSame(details, error.details);
  }

  @Test
  public void functionsException_ioExceptionCause_isUnavailable() {
    RNFBFunctionsError error =
        RNFBFunctionsError.from(
            new FirebaseFunctionsException(
                "INTERNAL",
                FirebaseFunctionsException.Code.INTERNAL,
                null,
                new IOException("connection refused")));

    assertEquals("UNAVAILABLE", error.code);
    assertEquals("UNAVAILABLE", error.message);
  }

  @Test
  public void functionsException_ioExceptionTimeout_staysDeadlineExceeded() {
    RNFBFunctionsError error =
        RNFBFunctionsError.from(
            new FirebaseFunctionsException(
                "DEADLINE_EXCEEDED",
                FirebaseFunctionsException.Code.DEADLINE_EXCEEDED,
                null,
                new SocketTimeoutException("timeout")));

    assertEquals("DEADLINE_EXCEEDED", error.code);
    assertEquals("DEADLINE_EXCEEDED", error.message);
  }

  @Test
  public void otherThrowable_isUnknown_withMessageOrDescription() {
    assertEquals("boom", RNFBFunctionsError.from(new IllegalStateException("boom")).message);

    RNFBFunctionsError error = RNFBFunctionsError.from(new IllegalStateException());

    assertEquals("UNKNOWN", error.code);
    assertEquals("java.lang.IllegalStateException", error.message);
    assertNull(error.details);
  }
}
