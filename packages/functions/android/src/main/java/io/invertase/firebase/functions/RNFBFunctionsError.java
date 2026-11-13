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

import com.google.firebase.FirebaseNetworkException;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.functions.FirebaseFunctionsException;
import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.IdentityHashMap;
import java.util.Map;
import java.util.Set;
import javax.annotation.Nullable;

/**
 * The code, message and details a failed callable reports to JS, derived from the throwable the
 * call or stream failed with.
 */
final class RNFBFunctionsError {
  static final String DOMAIN_KEY = "domain";
  static final String NATIVE_CODE_KEY = "nativeCode";

  /**
   * The {@code details.domain} reported for Auth ID token fetch failures. Fixed strings rather than
   * the thrown class name, which varies by Auth exception subclass and can be renamed by R8.
   */
  static final String NETWORK_ERROR_DOMAIN = "com.google.firebase.FirebaseNetworkException";

  static final String AUTH_ERROR_DOMAIN = "com.google.firebase.auth.FirebaseAuthException";

  /**
   * Firebase Auth error codes for a signed-in credential that is gone for good. Every other Auth
   * code (rate limit, internal, app configuration) leaves the credential valid.
   */
  private static final Set<String> DEAD_CREDENTIAL_AUTH_ERROR_CODES =
      new HashSet<>(
          Arrays.asList(
              "ERROR_USER_DISABLED",
              "ERROR_USER_NOT_FOUND",
              "ERROR_INVALID_USER_TOKEN",
              "ERROR_USER_TOKEN_EXPIRED"));

  private static final String UNKNOWN = "UNKNOWN";
  private static final String UNAVAILABLE = FirebaseFunctionsException.Code.UNAVAILABLE.name();
  private static final String UNAUTHENTICATED =
      FirebaseFunctionsException.Code.UNAUTHENTICATED.name();
  private static final String DEADLINE_EXCEEDED =
      FirebaseFunctionsException.Code.DEADLINE_EXCEEDED.name();

  final String code;
  final String message;
  @Nullable final Object details;

  private RNFBFunctionsError(String code, String message, @Nullable Object details) {
    this.code = code;
    this.message = message;
    this.details = details;
  }

  /**
   * Maps a callable failure to its JS error.
   *
   * <p>An Auth ID token fetch that fails before the request is sent arrives wrapped in {@code
   * ExecutionException}s (and, for streams, a {@code FirebaseFunctionsException} INTERNAL), so the
   * whole cause chain is searched for it: a network error maps to UNAVAILABLE and a dead credential
   * to UNAUTHENTICATED, with the underlying exception's message and {@code {domain, nativeCode}}
   * details. Other Auth errors fall through unchanged.
   *
   * <p>Otherwise a {@link FirebaseFunctionsException} (the throwable or its cause) supplies code,
   * message and details, a streaming error's {@code status} / {@code message} details override
   * them, and an {@link IOException} cause that is not a timeout maps to UNAVAILABLE. Anything else
   * is UNKNOWN with the throwable's message.
   */
  static RNFBFunctionsError from(Throwable throwable) {
    RNFBFunctionsError authTokenError = fromAuthTokenFailure(throwable);
    if (authTokenError != null) {
      return authTokenError;
    }

    FirebaseFunctionsException functionsException = null;
    if (throwable.getCause() instanceof FirebaseFunctionsException causeException) {
      functionsException = causeException;
    } else if (throwable instanceof FirebaseFunctionsException exception) {
      functionsException = exception;
    }

    if (functionsException == null) {
      return new RNFBFunctionsError(UNKNOWN, messageOf(throwable), null);
    }

    Object details = functionsException.getDetails();
    String code = functionsException.getCode().name();
    String message = functionsException.getMessage();

    if (details instanceof Map<?, ?> detailsMap) {
      if (detailsMap.get("status") instanceof String status) {
        code = status;
      }
      if (detailsMap.get("message") instanceof String detailsMessage) {
        message = detailsMessage;
      }
    }

    if (functionsException.getCause() instanceof IOException && !code.contains(DEADLINE_EXCEEDED)) {
      code = UNAVAILABLE;
      message = UNAVAILABLE;
    }

    return new RNFBFunctionsError(code, message, details);
  }

  @Nullable
  private static RNFBFunctionsError fromAuthTokenFailure(Throwable throwable) {
    Set<Throwable> seen = Collections.newSetFromMap(new IdentityHashMap<>());
    for (Throwable current = throwable; current != null && seen.add(current); ) {
      if (current instanceof FirebaseNetworkException) {
        return authTokenError(UNAVAILABLE, current, NETWORK_ERROR_DOMAIN, null);
      }
      if (current instanceof FirebaseAuthException authException
          && DEAD_CREDENTIAL_AUTH_ERROR_CODES.contains(authException.getErrorCode())) {
        return authTokenError(
            UNAUTHENTICATED, authException, AUTH_ERROR_DOMAIN, authException.getErrorCode());
      }
      current = current.getCause();
    }
    return null;
  }

  private static RNFBFunctionsError authTokenError(
      String code, Throwable exception, String domain, @Nullable String nativeCode) {
    Map<String, Object> details = new HashMap<>();
    details.put(DOMAIN_KEY, domain);
    details.put(NATIVE_CODE_KEY, nativeCode);
    return new RNFBFunctionsError(code, messageOf(exception), details);
  }

  private static String messageOf(Throwable throwable) {
    return throwable.getMessage() != null ? throwable.getMessage() : throwable.toString();
  }
}
