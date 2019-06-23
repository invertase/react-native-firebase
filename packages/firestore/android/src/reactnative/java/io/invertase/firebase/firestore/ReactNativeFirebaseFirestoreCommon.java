package io.invertase.firebase.firestore;

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


import com.facebook.react.bridge.Promise;
import com.google.firebase.firestore.FirebaseFirestoreException;

import javax.annotation.Nullable;

import static io.invertase.firebase.common.ReactNativeFirebaseModule.rejectPromiseWithCodeAndMessage;
import static io.invertase.firebase.common.ReactNativeFirebaseModule.rejectPromiseWithExceptionMap;

public class ReactNativeFirebaseFirestoreCommon {
  private static final String TAG = "FirestoreCommon";

  public static void rejectPromiseFirestoreException(Promise promise, Exception exception) {
    if (exception instanceof FirebaseFirestoreException) {
      UniversalFirestoreException universalException = new UniversalFirestoreException((FirebaseFirestoreException) exception, exception.getCause());
      rejectPromiseWithCodeAndMessage(promise, universalException.getCode(), universalException.getMessage());
    } else if (exception.getCause() instanceof FirebaseFirestoreException) {
      UniversalFirestoreException universalException = new UniversalFirestoreException((FirebaseFirestoreException) exception.getCause(), exception.getCause().getCause());
      rejectPromiseWithCodeAndMessage(promise, universalException.getCode(), universalException.getMessage());
    } else {
      rejectPromiseWithExceptionMap(promise, exception);
    }
  }

}
