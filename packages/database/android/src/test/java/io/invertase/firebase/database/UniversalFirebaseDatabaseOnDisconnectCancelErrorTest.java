package io.invertase.firebase.database;

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

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import android.content.Context;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.Task;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.OnDisconnect;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.MockedStatic;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.shadows.ShadowLooper;

/**
 * onDisconnect.cancel() is not rejected by RTDB {@code .write: false} (e2e wire evidence in
 * writePermissionDenied.e2e.js). Drive the CompletionListener error arm + TurboModule reject with a
 * mocked Firebase OnDisconnect — AndroidTest-AD-1.
 */
@RunWith(RobolectricTestRunner.class)
public class UniversalFirebaseDatabaseOnDisconnectCancelErrorTest {

  private static void stubCancelWithPermissionDenied(
      OnDisconnect onDisconnect, DatabaseReference ref) {
    doAnswer(
            invocation -> {
              DatabaseReference.CompletionListener listener = invocation.getArgument(0);
              listener.onComplete(DatabaseError.fromCode(DatabaseError.PERMISSION_DENIED), ref);
              return null;
            })
        .when(onDisconnect)
        .cancel(any(DatabaseReference.CompletionListener.class));
  }

  @Test
  public void onDisconnectCancel_taskFailsWithUniversalDatabaseException() {
    Context context = mock(Context.class);
    FirebaseDatabase firebaseDatabase = mock(FirebaseDatabase.class);
    DatabaseReference reference = mock(DatabaseReference.class);
    OnDisconnect onDisconnect = mock(OnDisconnect.class);

    when(firebaseDatabase.getReference("nope/foo")).thenReturn(reference);
    when(reference.onDisconnect()).thenReturn(onDisconnect);
    stubCancelWithPermissionDenied(onDisconnect, reference);

    try (MockedStatic<UniversalFirebaseDatabaseCommon> common =
        mockStatic(UniversalFirebaseDatabaseCommon.class)) {
      common
          .when(() -> UniversalFirebaseDatabaseCommon.getDatabaseForApp(anyString(), anyString()))
          .thenReturn(firebaseDatabase);

      UniversalFirebaseDatabaseOnDisconnectModule module =
          new UniversalFirebaseDatabaseOnDisconnectModule(context, "DatabaseOnDisconnect");

      Task<Void> task = module.onDisconnectCancel("app", "https://example.com", "nope/foo");

      assertTrue(task.isComplete());
      assertFalse(task.isSuccessful());
      assertTrue(task.getException() instanceof UniversalDatabaseException);
      UniversalDatabaseException databaseException =
          (UniversalDatabaseException) task.getException();
      assertTrue(databaseException.getCode().contains("permission-denied"));
    }
  }

  @Test
  public void turboOnDisconnectCancel_rejectsPromiseOnDatabaseError() {
    ReactApplicationContext reactContext = mock(ReactApplicationContext.class);
    when(reactContext.getApplicationContext()).thenReturn(reactContext);

    FirebaseDatabase firebaseDatabase = mock(FirebaseDatabase.class);
    DatabaseReference reference = mock(DatabaseReference.class);
    OnDisconnect onDisconnect = mock(OnDisconnect.class);

    when(firebaseDatabase.getReference("nope/foo")).thenReturn(reference);
    when(reference.onDisconnect()).thenReturn(onDisconnect);
    stubCancelWithPermissionDenied(onDisconnect, reference);

    Promise promise = mock(Promise.class);
    WritableMap userInfo = mock(WritableMap.class);

    try (MockedStatic<UniversalFirebaseDatabaseCommon> common =
            mockStatic(UniversalFirebaseDatabaseCommon.class);
        MockedStatic<com.facebook.react.bridge.Arguments> arguments =
            mockStatic(com.facebook.react.bridge.Arguments.class)) {
      common
          .when(() -> UniversalFirebaseDatabaseCommon.getDatabaseForApp(anyString(), anyString()))
          .thenReturn(firebaseDatabase);
      arguments.when(com.facebook.react.bridge.Arguments::createMap).thenReturn(userInfo);

      NativeRNFBTurboDatabaseOnDisconnect turbo =
          new NativeRNFBTurboDatabaseOnDisconnect(reactContext);
      turbo.onDisconnectCancel("app", "https://example.com", "nope/foo", promise);

      // addOnCompleteListener without an executor posts to the main looper.
      ShadowLooper.idleMainLooper();

      ArgumentCaptor<String> code = ArgumentCaptor.forClass(String.class);
      ArgumentCaptor<String> message = ArgumentCaptor.forClass(String.class);
      verify(promise).reject(code.capture(), message.capture(), any(WritableMap.class));
      assertTrue(code.getValue().contains("permission-denied"));
      assertNotNull(message.getValue());
    }
  }
}
