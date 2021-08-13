package io.invertase.firebase.common;

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

import android.content.ContentProvider;
import android.content.ContentValues;
import android.content.Context;
import android.content.pm.ProviderInfo;
import android.database.Cursor;
import android.net.Uri;
import androidx.annotation.Nullable;
import io.invertase.firebase.app.ReactNativeFirebaseApp;
import javax.annotation.OverridingMethodsMustInvokeSuper;

public class ReactNativeFirebaseInitProvider extends ContentProvider {
  @Override
  public void attachInfo(Context context, ProviderInfo info) {
    super.attachInfo(context, info);
  }

  @Override
  @OverridingMethodsMustInvokeSuper
  public boolean onCreate() {
    if (ReactNativeFirebaseApp.getApplicationContext() == null) {
      Context applicationContext = getContext();
      if (applicationContext != null && applicationContext.getApplicationContext() != null) {
        applicationContext = applicationContext.getApplicationContext();
      }
      ReactNativeFirebaseApp.setApplicationContext(applicationContext);
    }

    return false;
  }

  @Nullable
  @Override
  public Cursor query(
      Uri uri, String[] projection, String selection, String[] selectionArgs, String sortOrder) {
    return null;
  }

  @Nullable
  @Override
  public String getType(Uri uri) {
    return null;
  }

  @Nullable
  @Override
  public Uri insert(Uri uri, ContentValues values) {
    return null;
  }

  @Override
  public int delete(Uri uri, String selection, String[] selectionArgs) {
    return 0;
  }

  @Override
  public int update(Uri uri, ContentValues values, String selection, String[] selectionArgs) {
    return 0;
  }
}
