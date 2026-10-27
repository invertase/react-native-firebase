package io.invertase.firebase.appcheck;

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
import static org.junit.Assert.assertThrows;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import android.util.Log;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.FirebaseApp;
import com.google.firebase.appcheck.AppCheckProvider;
import com.google.firebase.appcheck.AppCheckToken;
import java.util.concurrent.ExecutionException;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.mockito.MockedStatic;

/**
 * JVM coverage for {@link ReactNativeFirebaseAppCheckProvider} configure / token requests. Firebase
 * lookups and native delegate construction are replaced through the package-private seams.
 */
public class ReactNativeFirebaseAppCheckProviderTest {

  private static final class FakeDelegate implements AppCheckProvider {
    final Task<AppCheckToken> task = Tasks.forException(new Exception("fake-delegate"));
    final Task<AppCheckToken> limitedUseTask =
        Tasks.forException(new Exception("fake-delegate-limited-use"));
    int getTokenCount;
    int getLimitedUseTokenCount;

    @Override
    public Task<AppCheckToken> getToken() {
      getTokenCount++;
      return task;
    }

    @Override
    public Task<AppCheckToken> getLimitedUseToken() {
      getLimitedUseTokenCount++;
      return limitedUseTask;
    }
  }

  private static final class TestProvider extends ReactNativeFirebaseAppCheckProvider {
    final FirebaseApp app = mock(FirebaseApp.class);
    final FakeDelegate debugDelegate = new FakeDelegate();
    final FakeDelegate playIntegrityDelegate = new FakeDelegate();
    String lastAppName;
    FirebaseApp lastDebugApp;
    String lastDebugToken;
    FirebaseApp lastPlayIntegrityApp;
    RuntimeException getFirebaseAppFailure;

    @Override
    FirebaseApp getFirebaseApp(String appName) {
      lastAppName = appName;
      if (getFirebaseAppFailure != null) {
        throw getFirebaseAppFailure;
      }
      return app;
    }

    @Override
    AppCheckProvider createDebugProvider(FirebaseApp app, String debugToken) {
      lastDebugApp = app;
      lastDebugToken = debugToken;
      return debugDelegate;
    }

    @Override
    AppCheckProvider createPlayIntegrityProvider(FirebaseApp app) {
      lastPlayIntegrityApp = app;
      return playIntegrityDelegate;
    }
  }

  private MockedStatic<Log> log;

  @Before
  public void setUp() {
    log = mockStatic(Log.class);
  }

  @After
  public void tearDown() {
    log.close();
  }

  @Test
  public void getToken_withoutConfigure_failsClosedInsteadOfThrowing() {
    Task<AppCheckToken> task = new ReactNativeFirebaseAppCheckProvider().getToken();

    assertTrue(task.isComplete());
    assertFalse(task.isSuccessful());
    assertTrue(task.getException() instanceof IllegalStateException);
    assertEquals(
        ReactNativeFirebaseAppCheckProvider.PROVIDER_NOT_READY_MESSAGE,
        task.getException().getMessage());
  }

  @Test
  public void getLimitedUseToken_withoutConfigure_failsClosedInsteadOfThrowing() {
    Task<AppCheckToken> task = new ReactNativeFirebaseAppCheckProvider().getLimitedUseToken();

    assertTrue(task.isComplete());
    assertFalse(task.isSuccessful());
    assertTrue(task.getException() instanceof IllegalStateException);
    assertEquals(
        ReactNativeFirebaseAppCheckProvider.PROVIDER_NOT_READY_MESSAGE,
        task.getException().getMessage());
  }

  @Test
  public void getLimitedUseToken_forwardsToDelegateLimitedUseToken() {
    TestProvider provider = new TestProvider();
    provider.configure("[DEFAULT]", "debug", "token-123");

    assertSame(provider.debugDelegate.limitedUseTask, provider.getLimitedUseToken());
    assertEquals(1, provider.debugDelegate.getLimitedUseTokenCount);
    assertEquals(0, provider.debugDelegate.getTokenCount);
  }

  @Test
  public void configure_debug_setsDelegateAndGetTokenDelegates() {
    TestProvider provider = new TestProvider();

    provider.configure("[DEFAULT]", "debug", "token-123");

    assertSame(provider.debugDelegate, provider.delegateProvider);
    assertEquals("[DEFAULT]", provider.lastAppName);
    assertSame(provider.app, provider.lastDebugApp);
    assertEquals("token-123", provider.lastDebugToken);
    assertSame(provider.debugDelegate.task, provider.getToken());
    assertEquals(1, provider.debugDelegate.getTokenCount);
  }

  @Test
  public void configure_debugWithoutToken_passesNullToken() {
    TestProvider provider = new TestProvider();

    provider.configure("[DEFAULT]", "debug", null);

    assertSame(provider.debugDelegate, provider.delegateProvider);
    assertNull(provider.lastDebugToken);
  }

  @Test
  public void configure_playIntegrity_setsDelegate() {
    TestProvider provider = new TestProvider();

    provider.configure("secondary", "playIntegrity", null);

    assertSame(provider.playIntegrityDelegate, provider.delegateProvider);
    assertEquals("secondary", provider.lastAppName);
    assertSame(provider.app, provider.lastPlayIntegrityApp);
    assertSame(provider.playIntegrityDelegate.task, provider.getToken());
  }

  @Test
  public void configure_unknownName_throwsWithValidProviderList() {
    TestProvider provider = new TestProvider();

    RuntimeException e =
        assertThrows(
            RuntimeException.class, () -> provider.configure("[DEFAULT]", "safetyNet", null));
    assertEquals(
        "Unknown provider name \"safetyNet\". Valid providers are: debug, playIntegrity.",
        e.getMessage());
    assertNull(provider.delegateProvider);
  }

  @Test
  public void reconfigure_validThenInvalid_throwsAndClearsStaleDelegate() {
    TestProvider provider = new TestProvider();
    provider.configure("[DEFAULT]", "debug", "token-123");

    RuntimeException e =
        assertThrows(
            RuntimeException.class, () -> provider.configure("[DEFAULT]", "safetyNet", null));
    assertTrue(e.getMessage().contains("Unknown provider name \"safetyNet\""));

    assertNull(provider.delegateProvider);
    Task<AppCheckToken> task = provider.getToken();
    assertFalse(task.isSuccessful());
    assertEquals(
        ReactNativeFirebaseAppCheckProvider.PROVIDER_NOT_READY_MESSAGE,
        task.getException().getMessage());
    assertEquals(0, provider.debugDelegate.getTokenCount);
  }

  @Test
  public void reconfigure_firebaseAppLookupFails_throwsAndClearsStaleDelegate() {
    TestProvider provider = new TestProvider();
    provider.configure("[DEFAULT]", "debug", "token-123");
    provider.getFirebaseAppFailure = new IllegalStateException("x");

    RuntimeException e =
        assertThrows(
            RuntimeException.class, () -> provider.configure("[DEFAULT]", "debug", "token-123"));
    assertEquals("x", e.getMessage());

    assertNull(provider.delegateProvider);
    Task<AppCheckToken> task = provider.getToken();
    assertFalse(task.isSuccessful());
    assertEquals(
        ReactNativeFirebaseAppCheckProvider.PROVIDER_NOT_READY_MESSAGE,
        task.getException().getMessage());
    assertEquals(0, provider.debugDelegate.getTokenCount);
  }

  @Test
  public void reconfigure_switchesDelegate() {
    TestProvider provider = new TestProvider();
    provider.configure("[DEFAULT]", "debug", null);

    provider.configure("[DEFAULT]", "playIntegrity", null);

    assertSame(provider.playIntegrityDelegate, provider.delegateProvider);
  }

  @Test
  public void activateProviderName_releaseUsesPlayIntegrityDebuggableUsesDebug() {
    assertEquals("playIntegrity", NativeRNFBTurboAppCheck.activateProviderName(false));
    assertEquals("debug", NativeRNFBTurboAppCheck.activateProviderName(true));
  }

  @Test
  public void activateProviderName_releaseNameIsAcceptedByProvider() {
    TestProvider provider = new TestProvider();

    provider.configure("[DEFAULT]", NativeRNFBTurboAppCheck.activateProviderName(false), null);

    assertSame(provider.playIntegrityDelegate, provider.delegateProvider);
  }

  @Test
  public void buildConfigDebugToken_unsetSentinelComparedByValue() {
    assertNull(NativeRNFBTurboAppCheck.buildConfigDebugToken(new String("null")));
    assertNull(NativeRNFBTurboAppCheck.buildConfigDebugToken("null"));
    assertEquals("abc-123", NativeRNFBTurboAppCheck.buildConfigDebugToken("abc-123"));
    assertNull(NativeRNFBTurboAppCheck.buildConfigDebugToken(null));
  }

  @Test
  public void tokenErrorCode_providerNotReadyWrappedByTasksAwait_isProviderNotReady() {
    Exception notReady = new ReactNativeFirebaseAppCheckProvider().getToken().getException();
    Exception wrapped = new ExecutionException(notReady);

    assertEquals("provider-not-ready", NativeRNFBTurboAppCheck.tokenErrorCode(wrapped));
    assertEquals(
        ReactNativeFirebaseAppCheckProvider.PROVIDER_NOT_READY_MESSAGE,
        NativeRNFBTurboAppCheck.tokenErrorMessage(wrapped));
  }

  @Test
  public void tokenErrorCode_limitedUseProviderNotReady_isProviderNotReady() {
    Exception notReady =
        new ReactNativeFirebaseAppCheckProvider().getLimitedUseToken().getException();

    assertEquals("provider-not-ready", NativeRNFBTurboAppCheck.tokenErrorCode(notReady));
    assertEquals(
        "provider-not-ready",
        NativeRNFBTurboAppCheck.tokenErrorCode(new ExecutionException(notReady)));
  }

  @Test
  public void tokenErrorCode_otherFailures_isTokenError() {
    Exception delegateFailure = new ExecutionException(new Exception("fake-delegate"));
    Exception noFactory = new Exception("No AppCheckProvider installed.");
    Exception sameMessage =
        new IllegalStateException(ReactNativeFirebaseAppCheckProvider.PROVIDER_NOT_READY_MESSAGE);

    assertEquals("token-error", NativeRNFBTurboAppCheck.tokenErrorCode(delegateFailure));
    assertEquals("token-error", NativeRNFBTurboAppCheck.tokenErrorCode(noFactory));
    assertEquals("token-error", NativeRNFBTurboAppCheck.tokenErrorCode(sameMessage));
    assertEquals(
        "token-error",
        NativeRNFBTurboAppCheck.tokenErrorCode(new ExecutionException((Throwable) null)));
    assertEquals(
        delegateFailure.getMessage(), NativeRNFBTurboAppCheck.tokenErrorMessage(delegateFailure));
  }

  private static ReactNativeFirebaseAppCheckProviderFactory factoryWith(
      String appName, ReactNativeFirebaseAppCheckProvider provider) {
    ReactNativeFirebaseAppCheckProviderFactory factory =
        new ReactNativeFirebaseAppCheckProviderFactory();
    factory.providers.put(appName, provider);
    return factory;
  }

  @Test
  public void isProviderReady_noProvider_isFalse() {
    assertFalse(new ReactNativeFirebaseAppCheckProviderFactory().isProviderReady("[DEFAULT]"));
  }

  @Test
  public void isProviderReady_providerWithNullDelegate_isFalse() {
    ReactNativeFirebaseAppCheckProviderFactory factory =
        factoryWith("[DEFAULT]", new ReactNativeFirebaseAppCheckProvider());

    assertFalse(factory.isProviderReady("[DEFAULT]"));
  }

  @Test
  public void isProviderReady_configuredProvider_isTrueOnlyForThatApp() {
    TestProvider provider = new TestProvider();
    provider.configure("[DEFAULT]", "debug", null);
    ReactNativeFirebaseAppCheckProviderFactory factory = factoryWith("[DEFAULT]", provider);

    assertTrue(factory.isProviderReady("[DEFAULT]"));
    assertFalse(factory.isProviderReady("secondaryFromNative"));
  }

  @Test
  public void isProviderReady_failedReconfigure_isFalse() {
    TestProvider provider = new TestProvider();
    provider.configure("[DEFAULT]", "debug", null);
    ReactNativeFirebaseAppCheckProviderFactory factory = factoryWith("[DEFAULT]", provider);

    assertThrows(RuntimeException.class, () -> provider.configure("[DEFAULT]", "safetyNet", null));

    assertFalse(factory.isProviderReady("[DEFAULT]"));
  }

  @Test
  public void rejectIfProviderNotReady_notReady_rejectsWithProviderNotReady() {
    Promise promise = mock(Promise.class);
    WritableMap map = mock(WritableMap.class);
    try (MockedStatic<Arguments> arguments = mockStatic(Arguments.class)) {
      when(Arguments.createMap()).thenReturn(map);

      assertTrue(
          NativeRNFBTurboAppCheck.rejectIfProviderNotReady(
              new ReactNativeFirebaseAppCheckProviderFactory(), "[DEFAULT]", promise));
      assertTrue(
          NativeRNFBTurboAppCheck.rejectIfProviderNotReady(
              factoryWith("[DEFAULT]", new ReactNativeFirebaseAppCheckProvider()),
              "[DEFAULT]",
              promise));
    }

    verify(promise, times(2))
        .reject(
            "provider-not-ready",
            ReactNativeFirebaseAppCheckProvider.PROVIDER_NOT_READY_MESSAGE,
            map);
    verify(map, times(2)).putString("code", "provider-not-ready");
    verify(map, times(2))
        .putString("message", ReactNativeFirebaseAppCheckProvider.PROVIDER_NOT_READY_MESSAGE);
  }

  @Test
  public void rejectIfProviderNotReady_ready_doesNotTouchPromise() {
    TestProvider provider = new TestProvider();
    provider.configure("[DEFAULT]", "debug", null);
    Promise promise = mock(Promise.class);

    assertFalse(
        NativeRNFBTurboAppCheck.rejectIfProviderNotReady(
            factoryWith("[DEFAULT]", provider), "[DEFAULT]", promise));
    verifyNoInteractions(promise);
  }

  @Test
  public void tokenErrorCodeAndMessage_nullException_doNotThrow() {
    assertEquals("token-error", NativeRNFBTurboAppCheck.tokenErrorCode(null));
    assertNull(NativeRNFBTurboAppCheck.tokenErrorMessage(null));
  }
}
