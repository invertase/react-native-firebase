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
 */

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import android.content.SharedPreferences;
import java.lang.reflect.Field;
import org.junit.Before;
import org.junit.Test;

/** Proves the Kotlin port preserves calls that Java permits with null reference arguments. */
public class ReactNativeFirebasePreferencesJavaCompatibilityTest {
  private SharedPreferences preferences;
  private SharedPreferences.Editor editor;
  private ReactNativeFirebasePreferences subject;

  @Before
  public void setUp() throws Exception {
    preferences = mock(SharedPreferences.class);
    editor = mock(SharedPreferences.Editor.class);
    when(preferences.edit()).thenReturn(editor);
    when(editor.putBoolean(null, true)).thenReturn(editor);
    when(editor.putInt(null, 42)).thenReturn(editor);
    when(editor.putLong(null, 4294967296L)).thenReturn(editor);
    when(editor.putString(null, null)).thenReturn(editor);
    when(preferences.contains(null)).thenReturn(false);
    when(preferences.getBoolean(null, true)).thenReturn(false);
    when(preferences.getInt(null, 42)).thenReturn(42);
    when(preferences.getLong(null, 4294967296L)).thenReturn(4294967296L);
    when(preferences.getString(null, null)).thenReturn(null);

    subject = new ReactNativeFirebasePreferences();
    Field field = ReactNativeFirebasePreferences.class.getDeclaredField("preferences");
    field.setAccessible(true);
    field.set(subject, preferences);
  }

  @Test
  public void publicAccessorsAcceptNullKeysFromJava() {
    assertFalse(subject.contains(null));
    subject.setBooleanValue(null, true);
    assertFalse(subject.getBooleanValue(null, true));
    subject.setIntValue(null, 42);
    subject.getIntValue(null, 42);
    subject.setLongValue(null, 4294967296L);
    subject.getLongValue(null, 4294967296L);

    verify(preferences).contains(null);
    verify(editor).putBoolean(null, true);
    verify(preferences).getBoolean(null, true);
    verify(editor).putInt(null, 42);
    verify(preferences).getInt(null, 42);
    verify(editor).putLong(null, 4294967296L);
    verify(preferences).getLong(null, 4294967296L);
    verify(editor, times(3)).apply();
  }

  @Test
  public void stringAccessorsAcceptNullKeyValueAndDefaultAndReturnNullToJava() {
    subject.setStringValue(null, null);

    assertNull(subject.getStringValue(null, null));
    verify(editor).putString(null, null);
    verify(editor).apply();
    verify(preferences).getString(null, null);
  }
}
