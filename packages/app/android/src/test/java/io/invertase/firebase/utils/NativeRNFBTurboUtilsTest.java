package io.invertase.firebase.utils;

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
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockConstruction;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import android.app.Activity;
import android.app.Dialog;
import android.content.IntentSender;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.os.Build;
import android.os.Environment;
import android.provider.Settings;
import android.util.Log;
import com.facebook.fbreact.specs.NativeRNFBTurboUtilsSpec;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import io.invertase.firebase.app.ReactNativeFirebaseApp;
import java.io.File;
import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockedConstruction;
import org.mockito.MockedStatic;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.RuntimeEnvironment;
import org.robolectric.util.ReflectionHelpers;

/** JVM branch and ABI coverage for {@link NativeRNFBTurboUtils}. */
@RunWith(RobolectricTestRunner.class)
public class NativeRNFBTurboUtilsTest {

  private android.app.Application application;
  private ReactApplicationContext reactContext;
  private PackageManager packageManager;
  private String packageName;
  private File filesDirectory;
  private File cacheDirectory;
  private File externalDirectory;

  @Before
  public void setUp() {
    application = RuntimeEnvironment.getApplication();
    ReactNativeFirebaseApp.setApplicationContext(application);
    Settings.System.putString(application.getContentResolver(), "firebase.test.lab", null);

    packageName = application.getPackageName();
    packageManager = mock(PackageManager.class);
    filesDirectory = new File("/data/files");
    cacheDirectory = new File("/data/cache");
    externalDirectory = new File("/external/app");

    reactContext = mock(ReactApplicationContext.class);
    when(reactContext.getApplicationContext()).thenReturn(application);
    when(reactContext.getPackageName()).thenReturn(packageName);
    when(reactContext.getPackageManager()).thenReturn(packageManager);
    when(reactContext.getFilesDir()).thenReturn(filesDirectory);
    when(reactContext.getCacheDir()).thenReturn(cacheDirectory);
    when(reactContext.getExternalFilesDir(null)).thenReturn(externalDirectory);
  }

  @After
  public void tearDown() {
    Settings.System.putString(application.getContentResolver(), "firebase.test.lab", null);
  }

  @Test
  public void javaAbi_preservesOpenClassPublicConstructorSpecAndConstantsSignature()
      throws Exception {
    assertTrue(Modifier.isPublic(NativeRNFBTurboUtils.class.getModifiers()));
    assertFalse(Modifier.isFinal(NativeRNFBTurboUtils.class.getModifiers()));
    assertEquals(NativeRNFBTurboUtilsSpec.class, NativeRNFBTurboUtils.class.getSuperclass());

    Constructor<NativeRNFBTurboUtils> constructor =
        NativeRNFBTurboUtils.class.getDeclaredConstructor(ReactApplicationContext.class);
    assertTrue(Modifier.isPublic(constructor.getModifiers()));

    Method constants = NativeRNFBTurboUtils.class.getDeclaredMethod("getTypedExportedConstants");
    assertTrue(Modifier.isProtected(constants.getModifiers()));
    assertEquals(Map.class, constants.getReturnType());
    ParameterizedType returnType = (ParameterizedType) constants.getGenericReturnType();
    assertEquals(String.class, returnType.getActualTypeArguments()[0]);
    assertEquals(Object.class, returnType.getActualTypeArguments()[1]);
  }

  @Test
  public void androidGetPlayServicesStatus_successReturnsOnlyStatusAndAvailability() {
    Promise promise = mock(Promise.class);
    WritableMap result = mock(WritableMap.class);
    GoogleApiAvailability gapi = mock(GoogleApiAvailability.class);
    when(gapi.isGooglePlayServicesAvailable(reactContext)).thenReturn(ConnectionResult.SUCCESS);

    try (MockedStatic<GoogleApiAvailability> googleApis = mockStatic(GoogleApiAvailability.class);
        MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      googleApis.when(GoogleApiAvailability::getInstance).thenReturn(gapi);
      arguments.when(Arguments::createMap).thenReturn(result);

      new NativeRNFBTurboUtils(reactContext).androidGetPlayServicesStatus(promise);

      verify(result).putInt("status", ConnectionResult.SUCCESS);
      verify(result).putBoolean("isAvailable", true);
      verify(result, never()).putString(eq("error"), anyString());
      verify(result, never()).putBoolean(eq("isUserResolvableError"), any(Boolean.class));
      verify(result, never()).putBoolean(eq("hasResolution"), any(Boolean.class));
      verify(promise).resolve(result);
    }
  }

  @Test
  public void androidGetPlayServicesStatus_failureReturnsExactErrorShape() {
    Promise promise = mock(Promise.class);
    WritableMap result = mock(WritableMap.class);
    GoogleApiAvailability gapi = mock(GoogleApiAvailability.class);
    int status = ConnectionResult.SERVICE_VERSION_UPDATE_REQUIRED;
    when(gapi.isGooglePlayServicesAvailable(reactContext)).thenReturn(status);
    when(gapi.getErrorString(status)).thenReturn("SERVICE_VERSION_UPDATE_REQUIRED");
    when(gapi.isUserResolvableError(status)).thenReturn(true);
    AtomicReference<Object> constructedStatus = new AtomicReference<>();

    try (MockedStatic<GoogleApiAvailability> googleApis = mockStatic(GoogleApiAvailability.class);
        MockedStatic<Arguments> arguments = mockStatic(Arguments.class);
        MockedConstruction<ConnectionResult> connectionResults =
            mockConstruction(
                ConnectionResult.class,
                (mock, context) -> {
                  constructedStatus.set(context.arguments().get(0));
                  when(mock.hasResolution()).thenReturn(true);
                })) {
      googleApis.when(GoogleApiAvailability::getInstance).thenReturn(gapi);
      arguments.when(Arguments::createMap).thenReturn(result);

      new NativeRNFBTurboUtils(reactContext).androidGetPlayServicesStatus(promise);

      assertEquals(status, constructedStatus.get());
      verify(result).putInt("status", status);
      verify(result).putBoolean("isAvailable", false);
      verify(result).putString("error", "SERVICE_VERSION_UPDATE_REQUIRED");
      verify(result).putBoolean("isUserResolvableError", true);
      verify(result).putBoolean("hasResolution", true);
      verify(promise).resolve(result);
    }
  }

  @Test
  public void androidPromptForPlayServices_getsStatusBeforeGapiAndShowsDialog() {
    Promise promise = mock(Promise.class);
    Activity activity = mock(Activity.class);
    Dialog dialog = mock(Dialog.class);
    GoogleApiAvailability gapi = mock(GoogleApiAvailability.class);
    int status = ConnectionResult.SERVICE_MISSING;
    when(reactContext.getCurrentActivity()).thenReturn(activity);
    when(gapi.isGooglePlayServicesAvailable(reactContext)).thenReturn(status);
    when(gapi.isUserResolvableError(status)).thenReturn(true);
    when(gapi.getErrorDialog(activity, status, status)).thenReturn(dialog);

    AtomicReference<Integer> getInstanceCalls = new AtomicReference<>(0);
    try (MockedStatic<GoogleApiAvailability> googleApis = mockStatic(GoogleApiAvailability.class)) {
      googleApis
          .when(GoogleApiAvailability::getInstance)
          .thenAnswer(
              invocation -> {
                getInstanceCalls.set(getInstanceCalls.get() + 1);
                return gapi;
              });

      new NativeRNFBTurboUtils(reactContext).androidPromptForPlayServices(promise);

      assertEquals(Integer.valueOf(2), getInstanceCalls.get());
      verify(gapi).isGooglePlayServicesAvailable(reactContext);
      verify(gapi).isUserResolvableError(status);
      verify(gapi).getErrorDialog(activity, status, status);
      verify(dialog).show();
      verify(promise).resolve(null);
    }
  }

  @Test
  public void androidPromptForPlayServices_skipsDialogForSuccessUnresolvableOrNullActivity() {
    assertPromptSkipsDialog(ConnectionResult.SUCCESS, true, mock(Activity.class));
    assertPromptSkipsDialog(ConnectionResult.SERVICE_INVALID, false, mock(Activity.class));
    assertPromptSkipsDialog(ConnectionResult.SERVICE_MISSING, true, null);
  }

  @Test
  public void androidResolutionForPlayServices_startsResolutionAndAlwaysResolves()
      throws Exception {
    Promise promise = mock(Promise.class);
    Activity activity = mock(Activity.class);
    GoogleApiAvailability gapi = mock(GoogleApiAvailability.class);
    int status = ConnectionResult.RESOLUTION_REQUIRED;
    when(reactContext.getCurrentActivity()).thenReturn(activity);
    when(gapi.isGooglePlayServicesAvailable(reactContext)).thenReturn(status);
    AtomicReference<Object> constructedStatus = new AtomicReference<>();

    try (MockedStatic<GoogleApiAvailability> googleApis = mockStatic(GoogleApiAvailability.class);
        MockedConstruction<ConnectionResult> connectionResults =
            mockConstruction(
                ConnectionResult.class,
                (mock, context) -> {
                  constructedStatus.set(context.arguments().get(0));
                  when(mock.isSuccess()).thenReturn(false);
                  when(mock.hasResolution()).thenReturn(true);
                })) {
      googleApis.when(GoogleApiAvailability::getInstance).thenReturn(gapi);

      new NativeRNFBTurboUtils(reactContext).androidResolutionForPlayServices(promise);

      assertEquals(status, constructedStatus.get());
      verify(connectionResults.constructed().get(0)).startResolutionForResult(activity, status);
      verify(promise).resolve(null);
    }
  }

  @Test
  public void androidResolutionForPlayServices_skipsSuccessNoResolutionAndNullActivity() {
    assertResolutionSkipped(true, true, mock(Activity.class));
    assertResolutionSkipped(false, false, mock(Activity.class));
    assertResolutionSkipped(false, true, null);
  }

  @Test
  public void androidResolutionForPlayServices_logsSendIntentExceptionAndResolves()
      throws Exception {
    Promise promise = mock(Promise.class);
    Activity activity = mock(Activity.class);
    GoogleApiAvailability gapi = mock(GoogleApiAvailability.class);
    IntentSender.SendIntentException error = new IntentSender.SendIntentException("send failed");
    int status = ConnectionResult.RESOLUTION_REQUIRED;
    when(reactContext.getCurrentActivity()).thenReturn(activity);
    when(gapi.isGooglePlayServicesAvailable(reactContext)).thenReturn(status);

    try (MockedStatic<GoogleApiAvailability> googleApis = mockStatic(GoogleApiAvailability.class);
        MockedConstruction<ConnectionResult> connectionResults =
            mockConstruction(
                ConnectionResult.class,
                (mock, context) -> {
                  when(mock.isSuccess()).thenReturn(false);
                  when(mock.hasResolution()).thenReturn(true);
                  org.mockito.Mockito.doThrow(error)
                      .when(mock)
                      .startResolutionForResult(activity, status);
                });
        MockedStatic<Log> logs = mockStatic(Log.class)) {
      googleApis.when(GoogleApiAvailability::getInstance).thenReturn(gapi);

      new NativeRNFBTurboUtils(reactContext).androidResolutionForPlayServices(promise);

      logs.verify(() -> Log.d("Utils", "resolutionForPlayServices", error));
      verify(promise).resolve(null);
    }
  }

  @Test
  public void androidMakePlayServicesAvailable_successStatusResolvesImmediately() {
    Promise promise = mock(Promise.class);
    GoogleApiAvailability gapi = mock(GoogleApiAvailability.class);
    when(gapi.isGooglePlayServicesAvailable(reactContext)).thenReturn(ConnectionResult.SUCCESS);

    try (MockedStatic<GoogleApiAvailability> googleApis = mockStatic(GoogleApiAvailability.class);
        MockedStatic<UiThreadUtil> uiThread = mockStatic(UiThreadUtil.class)) {
      googleApis.when(GoogleApiAvailability::getInstance).thenReturn(gapi);

      new NativeRNFBTurboUtils(reactContext).androidMakePlayServicesAvailable(promise);

      verify(promise).resolve(null);
      uiThread.verifyNoInteractions();
    }
  }

  @Test
  public void androidMakePlayServicesAvailable_nonSuccessSchedulesUiAndNullActivityResolves() {
    Promise promise = mock(Promise.class);
    GoogleApiAvailability gapi = mock(GoogleApiAvailability.class);
    when(gapi.isGooglePlayServicesAvailable(reactContext))
        .thenReturn(ConnectionResult.SERVICE_MISSING);
    when(reactContext.getCurrentActivity()).thenReturn(null);
    AtomicReference<Runnable> scheduled = new AtomicReference<>();

    try (MockedStatic<GoogleApiAvailability> googleApis = mockStatic(GoogleApiAvailability.class);
        MockedStatic<UiThreadUtil> uiThread = mockStatic(UiThreadUtil.class)) {
      googleApis.when(GoogleApiAvailability::getInstance).thenReturn(gapi);
      uiThread
          .when(() -> UiThreadUtil.runOnUiThread(any(Runnable.class)))
          .thenAnswer(
              invocation -> {
                scheduled.set(invocation.getArgument(0));
                return null;
              });

      new NativeRNFBTurboUtils(reactContext).androidMakePlayServicesAvailable(promise);

      verifyNoInteractions(promise);
      scheduled.get().run();
      verify(promise).resolve(null);
      verify(gapi, never()).makeGooglePlayServicesAvailable(any(Activity.class));
    }
  }

  @Test
  public void androidMakePlayServicesAvailable_taskSuccessResolvesOnlyOnCompletion() {
    Task<Void> task = taskForCompletion(true, false, null);
    Promise promise = runMakeAvailableAndComplete(task);
    verify(promise).resolve(null);
  }

  @Test
  public void androidMakePlayServicesAvailable_taskCancellationUsesExactPromiseOverload() {
    Task<Void> task = taskForCompletion(false, true, null);
    Promise promise = runMakeAvailableAndComplete(task);
    verify(promise)
        .reject("play-services-update-canceled", "Play Services update was canceled by the user");
  }

  @Test
  public void androidMakePlayServicesAvailable_taskFailureUsesExceptionMessageAndCause() {
    Exception error = new Exception("update failed");
    Task<Void> task = taskForCompletion(false, false, error);
    Promise promise = runMakeAvailableAndComplete(task);
    verify(promise).reject("play-services-update-failed", "update failed", error);
  }

  @Test
  public void androidMakePlayServicesAvailable_taskFailurePreservesNullExceptionMessage() {
    Exception error = new Exception((String) null);
    Task<Void> task = taskForCompletion(false, false, error);
    Promise promise = runMakeAvailableAndComplete(task);
    verify(promise).reject("play-services-update-failed", null, error);
  }

  @Test
  public void androidMakePlayServicesAvailable_taskFailureWithoutExceptionUsesUnknownError() {
    Task<Void> task = taskForCompletion(false, false, null);
    Promise promise = runMakeAvailableAndComplete(task);
    verify(promise).reject("play-services-update-failed", "Unknown error", (Throwable) null);
  }

  @Test
  public void getTypedExportedConstants_readsGlobalTestLabSettingWithExactTrueSemantics()
      throws Exception {
    Settings.System.putString(application.getContentResolver(), "firebase.test.lab", "true");
    Map<String, Object> constants = invokeGetTypedExportedConstants();
    assertEquals(true, constants.get("isRunningInTestLab"));

    Settings.System.putString(application.getContentResolver(), "firebase.test.lab", "TRUE");
    constants = invokeGetTypedExportedConstants();
    assertEquals(false, constants.get("isRunningInTestLab"));
  }

  @Test
  public void getTypedExportedConstants_usesLegacyPackageManagerOverloadOnApi33Plus()
      throws Exception {
    stubVersionName("4.5.6");

    Map<String, Object> constants = invokeGetTypedExportedConstants();

    assertEquals("4.5.6", constants.get("appVersion"));
    verify(packageManager).getPackageInfo(packageName, 0);
  }

  @Test
  public void getTypedExportedConstants_usesSameLegacyOverloadBeforeApi33() throws Exception {
    int originalSdk = Build.VERSION.SDK_INT;
    ReflectionHelpers.setStaticField(Build.VERSION.class, "SDK_INT", Build.VERSION_CODES.S_V2);
    try {
      stubVersionName("4.5.6");

      Map<String, Object> constants = invokeGetTypedExportedConstants();

      assertEquals("4.5.6", constants.get("appVersion"));
      verify(packageManager).getPackageInfo(packageName, 0);
    } finally {
      ReflectionHelpers.setStaticField(Build.VERSION.class, "SDK_INT", originalSdk);
    }
  }

  @Test
  public void getTypedExportedConstants_omitsNullEmptyAndFailedAppVersions() throws Exception {
    stubVersionName(null);
    assertFalse(invokeGetTypedExportedConstants().containsKey("appVersion"));

    stubVersionName("");
    assertFalse(invokeGetTypedExportedConstants().containsKey("appVersion"));

    NameNotFoundException error = new NameNotFoundException(packageName);
    when(packageManager.getPackageInfo(anyString(), anyInt())).thenThrow(error);
    try (MockedStatic<Log> logs = mockStatic(Log.class)) {
      assertFalse(invokeGetTypedExportedConstants().containsKey("appVersion"));
      logs.verify(() -> Log.d("Utils", "getAppVersionName", error));
    }
  }

  @Test
  public void getTypedExportedConstants_exportsExactPathsAndKeys() throws Exception {
    stubVersionName("1.0");
    File pictures = new File("/storage/Pictures");
    File movies = new File("/storage/Movies");
    File storage = new File("/storage");

    try (MockedStatic<Environment> environment = mockStatic(Environment.class)) {
      environment
          .when(() -> Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES))
          .thenReturn(pictures);
      environment
          .when(() -> Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES))
          .thenReturn(movies);
      environment.when(Environment::getExternalStorageDirectory).thenReturn(storage);

      Map<String, Object> constants = invokeGetTypedExportedConstants();

      assertEquals(11, constants.size());
      assertEquals("", constants.get("MAIN_BUNDLE"));
      assertEquals(filesDirectory.getAbsolutePath(), constants.get("LIBRARY_DIRECTORY"));
      assertEquals(externalDirectory.getAbsolutePath(), constants.get("DOCUMENT_DIRECTORY"));
      assertEquals(externalDirectory.getAbsolutePath(), constants.get("EXTERNAL_DIRECTORY"));
      assertEquals(storage.getAbsolutePath(), constants.get("EXTERNAL_STORAGE_DIRECTORY"));
      assertEquals(pictures.getAbsolutePath(), constants.get("PICTURES_DIRECTORY"));
      assertEquals(movies.getAbsolutePath(), constants.get("MOVIES_DIRECTORY"));
      assertEquals(cacheDirectory.getAbsolutePath(), constants.get("TEMP_DIRECTORY"));
      assertEquals(cacheDirectory.getAbsolutePath(), constants.get("CACHES_DIRECTORY"));
    }
  }

  @Test
  public void getTypedExportedConstants_handlesNullExternalDirectoriesAndOmitsOptionalKeys()
      throws Exception {
    stubVersionName(null);
    when(reactContext.getExternalFilesDir(null)).thenReturn(null);

    try (MockedStatic<Environment> environment = mockStatic(Environment.class)) {
      environment
          .when(() -> Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES))
          .thenReturn(null);
      environment
          .when(() -> Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES))
          .thenReturn(null);
      environment.when(Environment::getExternalStorageDirectory).thenReturn(null);

      Map<String, Object> constants = invokeGetTypedExportedConstants();

      assertEquals(filesDirectory.getAbsolutePath(), constants.get("DOCUMENT_DIRECTORY"));
      assertEquals("", constants.get("PICTURES_DIRECTORY"));
      assertEquals("", constants.get("MOVIES_DIRECTORY"));
      assertFalse(constants.containsKey("EXTERNAL_DIRECTORY"));
      assertFalse(constants.containsKey("EXTERNAL_STORAGE_DIRECTORY"));
      assertFalse(constants.containsKey("appVersion"));
    }
  }

  @Test
  public void getTypedExportedConstants_usesDocumentFallbackBeforeKitkat() throws Exception {
    int originalSdk = Build.VERSION.SDK_INT;
    ReflectionHelpers.setStaticField(
        Build.VERSION.class, "SDK_INT", Build.VERSION_CODES.JELLY_BEAN_MR2);
    try {
      stubVersionName(null);

      Map<String, Object> constants = invokeGetTypedExportedConstants();

      assertEquals(filesDirectory.getAbsolutePath(), constants.get("DOCUMENT_DIRECTORY"));
      assertEquals(externalDirectory.getAbsolutePath(), constants.get("EXTERNAL_DIRECTORY"));
    } finally {
      ReflectionHelpers.setStaticField(Build.VERSION.class, "SDK_INT", originalSdk);
    }
  }

  private void assertPromptSkipsDialog(int status, boolean resolvable, Activity activity) {
    Promise promise = mock(Promise.class);
    GoogleApiAvailability gapi = mock(GoogleApiAvailability.class);
    when(reactContext.getCurrentActivity()).thenReturn(activity);
    when(gapi.isGooglePlayServicesAvailable(reactContext)).thenReturn(status);
    when(gapi.isUserResolvableError(status)).thenReturn(resolvable);

    try (MockedStatic<GoogleApiAvailability> googleApis = mockStatic(GoogleApiAvailability.class)) {
      googleApis.when(GoogleApiAvailability::getInstance).thenReturn(gapi);

      new NativeRNFBTurboUtils(reactContext).androidPromptForPlayServices(promise);

      verify(gapi, never()).getErrorDialog(any(Activity.class), anyInt(), anyInt());
      verify(promise).resolve(null);
    }
  }

  private void assertResolutionSkipped(boolean success, boolean hasResolution, Activity activity) {
    Promise promise = mock(Promise.class);
    GoogleApiAvailability gapi = mock(GoogleApiAvailability.class);
    int status = ConnectionResult.SERVICE_MISSING;
    when(reactContext.getCurrentActivity()).thenReturn(activity);
    when(gapi.isGooglePlayServicesAvailable(reactContext)).thenReturn(status);

    try (MockedStatic<GoogleApiAvailability> googleApis = mockStatic(GoogleApiAvailability.class);
        MockedConstruction<ConnectionResult> connectionResults =
            mockConstruction(
                ConnectionResult.class,
                (mock, context) -> {
                  when(mock.isSuccess()).thenReturn(success);
                  when(mock.hasResolution()).thenReturn(hasResolution);
                })) {
      googleApis.when(GoogleApiAvailability::getInstance).thenReturn(gapi);

      new NativeRNFBTurboUtils(reactContext).androidResolutionForPlayServices(promise);

      verify(connectionResults.constructed().get(0), never())
          .startResolutionForResult(any(Activity.class), anyInt());
      verify(promise).resolve(null);
    } catch (IntentSender.SendIntentException impossible) {
      throw new AssertionError(impossible);
    }
  }

  @SuppressWarnings("unchecked")
  private Task<Void> taskForCompletion(boolean successful, boolean canceled, Exception exception) {
    Task<Void> task = mock(Task.class);
    when(task.isSuccessful()).thenReturn(successful);
    when(task.isCanceled()).thenReturn(canceled);
    when(task.getException()).thenReturn(exception);
    return task;
  }

  private Promise runMakeAvailableAndComplete(Task<Void> task) {
    Promise promise = mock(Promise.class);
    Activity activity = mock(Activity.class);
    GoogleApiAvailability gapi = mock(GoogleApiAvailability.class);
    when(reactContext.getCurrentActivity()).thenReturn(activity);
    when(gapi.isGooglePlayServicesAvailable(reactContext))
        .thenReturn(ConnectionResult.SERVICE_MISSING);
    when(gapi.makeGooglePlayServicesAvailable(activity)).thenReturn(task);
    AtomicReference<Runnable> scheduled = new AtomicReference<>();
    AtomicReference<OnCompleteListener<Void>> listener = new AtomicReference<>();
    when(task.addOnCompleteListener(any()))
        .thenAnswer(
            invocation -> {
              listener.set(invocation.getArgument(0));
              return task;
            });

    try (MockedStatic<GoogleApiAvailability> googleApis = mockStatic(GoogleApiAvailability.class);
        MockedStatic<UiThreadUtil> uiThread = mockStatic(UiThreadUtil.class)) {
      googleApis.when(GoogleApiAvailability::getInstance).thenReturn(gapi);
      uiThread
          .when(() -> UiThreadUtil.runOnUiThread(any(Runnable.class)))
          .thenAnswer(
              invocation -> {
                scheduled.set(invocation.getArgument(0));
                return null;
              });

      new NativeRNFBTurboUtils(reactContext).androidMakePlayServicesAvailable(promise);

      verifyNoInteractions(promise);
      scheduled.get().run();
      verifyNoInteractions(promise);
      listener.get().onComplete(task);
      return promise;
    }
  }

  private void stubVersionName(String versionName) throws Exception {
    PackageInfo packageInfo = new PackageInfo();
    packageInfo.versionName = versionName;
    when(packageManager.getPackageInfo(anyString(), anyInt())).thenReturn(packageInfo);
  }

  @SuppressWarnings("unchecked")
  private Map<String, Object> invokeGetTypedExportedConstants() throws Exception {
    NativeRNFBTurboUtils module = new NativeRNFBTurboUtils(reactContext);
    Method method = NativeRNFBTurboUtils.class.getDeclaredMethod("getTypedExportedConstants");
    method.setAccessible(true);
    return (Map<String, Object>) method.invoke(module);
  }
}
