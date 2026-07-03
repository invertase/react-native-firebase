package io.invertase.firebase.auth;

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

/**
 * Structured sync TurboModule error carrying the same RNFB {@code code}/{@code message} pair used by
 * {@code rejectPromiseWithCodeAndMessage}.
 */
public class ReactNativeFirebaseAuthSyncException extends RuntimeException {
  private final String code;

  public ReactNativeFirebaseAuthSyncException(String code, String message) {
    super(message);
    this.code = code;
  }

  public String getCode() {
    return code;
  }
}
