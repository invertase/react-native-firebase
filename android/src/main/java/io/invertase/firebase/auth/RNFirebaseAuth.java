package io.invertase.firebase.auth;

import android.app.Activity;
import android.os.Parcel;
import android.util.Log;
import android.net.Uri;
import android.support.annotation.NonNull;

import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.HashMap;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReactContext;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;

import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseException;
import com.google.firebase.auth.ActionCodeResult;
import com.google.firebase.auth.ActionCodeSettings;
import com.google.firebase.auth.AuthCredential;
import com.google.firebase.auth.AuthResult;
import com.google.firebase.auth.FirebaseAuthInvalidCredentialsException;
import com.google.firebase.auth.FirebaseAuthProvider;
import com.google.firebase.auth.FirebaseUserMetadata;
import com.google.firebase.auth.GithubAuthProvider;
import com.google.firebase.auth.OAuthProvider;
import com.google.firebase.auth.PhoneAuthCredential;
import com.google.firebase.auth.PhoneAuthProvider;
import com.google.firebase.auth.ProviderQueryResult;
import com.google.firebase.auth.TwitterAuthProvider;
import com.google.firebase.auth.UserInfo;
import com.google.firebase.auth.UserProfileChangeRequest;
import com.google.firebase.auth.FacebookAuthProvider;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.auth.GetTokenResult;
import com.google.firebase.auth.GoogleAuthProvider;
import com.google.firebase.auth.EmailAuthProvider;

import io.invertase.firebase.Utils;

@SuppressWarnings("ThrowableResultOfMethodCallIgnored")
class RNFirebaseAuth extends ReactContextBaseJavaModule {
  private static final String TAG = "RNFirebaseAuth";
  private String mVerificationId;
  private PhoneAuthCredential mCredential;
  private ReactContext mReactContext;
  private HashMap<String, FirebaseAuth.AuthStateListener> mAuthListeners = new HashMap<>();
  private HashMap<String, FirebaseAuth.IdTokenListener> mIdTokenListeners = new HashMap<>();


  RNFirebaseAuth(ReactApplicationContext reactContext) {
    super(reactContext);
    mReactContext = reactContext;
    Log.d(TAG, "RNFirebaseAuth:initialized");
  }

  @Override
  public String getName() {
    return TAG;
  }

  /**
   * Add a new auth state listener - if one doesn't exist already
   */
  @ReactMethod
  public void addAuthStateListener(final String appName) {
    Log.d(TAG, "addAuthStateListener");

    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

    FirebaseAuth.AuthStateListener mAuthListener = mAuthListeners.get(appName);
    if (mAuthListener == null) {
      FirebaseAuth.AuthStateListener newAuthListener = new FirebaseAuth.AuthStateListener() {
        @Override
        public void onAuthStateChanged(@NonNull FirebaseAuth firebaseAuth) {
          FirebaseUser user = firebaseAuth.getCurrentUser();
          WritableMap msgMap = Arguments.createMap();
          if (user != null) {
            msgMap.putString("appName", appName); // for js side distribution
            msgMap.putMap("user", firebaseUserToMap(user));
            Utils.sendEvent(mReactContext, "auth_state_changed", msgMap);
          } else {
            msgMap.putString("appName", appName); // for js side distribution
            Utils.sendEvent(mReactContext, "auth_state_changed", msgMap);
          }
        }
      };

      firebaseAuth.addAuthStateListener(newAuthListener);
      mAuthListeners.put(appName, newAuthListener);
    }
  }

  /**
   * Removes the current auth state listener
   */
  @ReactMethod
  public void removeAuthStateListener(String appName) {
    Log.d(TAG, "removeAuthStateListener");

    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

    FirebaseAuth.AuthStateListener mAuthListener = mAuthListeners.get(appName);

    if (mAuthListener != null) {
      firebaseAuth.removeAuthStateListener(mAuthListener);
      mAuthListeners.remove(appName);
    }
  }

  /**
   * Add a new id token listener - if one doesn't exist already
   */
  @ReactMethod
  public void addIdTokenListener(final String appName) {
    Log.d(TAG, "addIdTokenListener");

    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

    if (!mIdTokenListeners.containsKey(appName)) {
      FirebaseAuth.IdTokenListener newIdTokenListener = new FirebaseAuth.IdTokenListener() {
        @Override
        public void onIdTokenChanged(@NonNull FirebaseAuth firebaseAuth) {
          FirebaseUser user = firebaseAuth.getCurrentUser();
          WritableMap msgMap = Arguments.createMap();
          if (user != null) {
            msgMap.putBoolean("authenticated", true);
            msgMap.putString("appName", appName); // for js side distribution
            msgMap.putMap("user", firebaseUserToMap(user));
            Utils.sendEvent(mReactContext, "auth_id_token_changed", msgMap);
          } else {
            msgMap.putString("appName", appName); // for js side distribution
            msgMap.putBoolean("authenticated", false);
            Utils.sendEvent(mReactContext, "auth_id_token_changed", msgMap);
          }
        }
      };

      firebaseAuth.addIdTokenListener(newIdTokenListener);
      mIdTokenListeners.put(appName, newIdTokenListener);
    }
  }

  /**
   * Removes the current id token listener
   */
  @ReactMethod
  public void removeIdTokenListener(String appName) {
    Log.d(TAG, "removeIdTokenListener");

    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

    FirebaseAuth.IdTokenListener mIdTokenListener = mIdTokenListeners.get(appName);

    if (mIdTokenListener != null) {
      firebaseAuth.removeIdTokenListener(mIdTokenListener);
      mIdTokenListeners.remove(appName);
    }
  }

  @ReactMethod
  public void signOut(String appName, Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

    Log.d(TAG, "signOut");
    if (firebaseAuth == null || firebaseAuth.getCurrentUser() == null) {
      promiseNoUser(promise, true);
    } else {
      firebaseAuth.signOut();
      promiseNoUser(promise, false);
    }
  }

  @ReactMethod
  public void signInAnonymously(String appName, final Promise promise) {
    signInAnonymously(appName, promise, false);
  }

  @ReactMethod
  public void signInAnonymouslyAndRetrieveData(String appName, final Promise promise) {
    signInAnonymously(appName, promise, true);
  }

  public void signInAnonymously(String appName, final Promise promise, final boolean withData) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

    Log.d(TAG, "signInAnonymously");
    firebaseAuth.signInAnonymously()
      .addOnSuccessListener(new OnSuccessListener<AuthResult>() {
        @Override
        public void onSuccess(AuthResult authResult) {
          Log.d(TAG, "signInAnonymously:onComplete:success");
          if (withData) {
            promiseWithAuthResult(authResult, promise);
          } else {
            promiseWithUser(authResult.getUser(), promise);
          }
        }
      })
      .addOnFailureListener(new OnFailureListener() {
        @Override
        public void onFailure(@NonNull Exception exception) {
          Log.e(TAG, "signInAnonymously:onComplete:failure", exception);
          promiseRejectAuthException(promise, exception);
        }
      });
  }

  /**
   * createUserWithEmailAndPassword
   *
   * @param email
   * @param password
   * @param promise
   */
  @ReactMethod
  public void createUserWithEmailAndPassword(String appName, final String email, final String password, final Promise promise) {
    createUserWithEmailAndPassword(appName, email, password, promise, false);
  }

  @ReactMethod
  public void createUserAndRetrieveDataWithEmailAndPassword(String appName, final String email, final String password, final Promise promise) {
    createUserWithEmailAndPassword(appName, email, password, promise, true);
  }

  public void createUserWithEmailAndPassword(String appName, final String email, final String password, final Promise promise, final boolean withData) {
    Log.d(TAG, "createUserWithEmailAndPassword");
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

    firebaseAuth.createUserWithEmailAndPassword(email, password)
      .addOnSuccessListener(new OnSuccessListener<AuthResult>() {
        @Override
        public void onSuccess(AuthResult authResult) {
          Log.d(TAG, "createUserWithEmailAndPassword:onComplete:success");
          if (withData) {
            promiseWithAuthResult(authResult, promise);
          } else {
            promiseWithUser(authResult.getUser(), promise);
          }
        }
      })
      .addOnFailureListener(new OnFailureListener() {
        @Override
        public void onFailure(@NonNull Exception exception) {
          Log.e(TAG, "createUserWithEmailAndPassword:onComplete:failure", exception);
          promiseRejectAuthException(promise, exception);
        }
      });
  }

  /**
   * signInWithEmailAndPassword
   *
   * @param email
   * @param password
   * @param promise
   */
  @ReactMethod
  public void signInWithEmailAndPassword(String appName, final String email, final String password, final Promise promise) {
    signInWithEmailAndPassword(appName, email, password, promise, false);
  }

  @ReactMethod
  public void signInAndRetrieveDataWithEmailAndPassword(String appName, final String email, final String password, final Promise promise) {
    signInWithEmailAndPassword(appName, email, password, promise, true);
  }

  public void signInWithEmailAndPassword(String appName, final String email, final String password, final Promise promise, final boolean withData) {
    Log.d(TAG, "signInWithEmailAndPassword");
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

    firebaseAuth.signInWithEmailAndPassword(email, password)
      .addOnSuccessListener(new OnSuccessListener<AuthResult>() {
        @Override
        public void onSuccess(AuthResult authResult) {
          Log.d(TAG, "signInWithEmailAndPassword:onComplete:success");
          if (withData) {
            promiseWithAuthResult(authResult, promise);
          } else {
            promiseWithUser(authResult.getUser(), promise);
          }
        }
      })
      .addOnFailureListener(new OnFailureListener() {
        @Override
        public void onFailure(@NonNull Exception exception) {
          Log.e(TAG, "signInWithEmailAndPassword:onComplete:failure", exception);
          promiseRejectAuthException(promise, exception);
        }
      });
  }


  @ReactMethod
  public void signInWithCustomToken(String appName, final String token, final Promise promise) {
    signInWithCustomToken(appName, token, promise, false);
  }


  @ReactMethod
  public void signInAndRetrieveDataWithCustomToken(String appName, final String token, final Promise promise) {
    signInWithCustomToken(appName, token, promise, true);
  }

  public void signInWithCustomToken(String appName, final String token, final Promise promise, final boolean withData) {
    Log.d(TAG, "signInWithCustomToken");
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

    firebaseAuth.signInWithCustomToken(token)
      .addOnSuccessListener(new OnSuccessListener<AuthResult>() {
        @Override
        public void onSuccess(AuthResult authResult) {
          Log.d(TAG, "signInWithCustomToken:onComplete:success");
          if (withData) {
            promiseWithAuthResult(authResult, promise);
          } else {
            promiseWithUser(authResult.getUser(), promise);
          }
        }
      })
      .addOnFailureListener(new OnFailureListener() {
        @Override
        public void onFailure(@NonNull Exception exception) {
          Log.e(TAG, "signInWithCustomToken:onComplete:failure", exception);
          promiseRejectAuthException(promise, exception);
        }
      });
  }

  /**
   * sendPasswordResetEmail
   *
   * @param email
   * @param promise
   */
  @ReactMethod
  public void sendPasswordResetEmail(String appName, final String email,
                                     ReadableMap actionCodeSettings, final Promise promise) {
    Log.d(TAG, "sendPasswordResetEmail");
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

    OnCompleteListener<Void> listener = new OnCompleteListener<Void>() {
      @Override
      public void onComplete(@NonNull Task<Void> task) {
        if (task.isSuccessful()) {
          Log.d(TAG, "sendPasswordResetEmail:onComplete:success");
          promiseNoUser(promise, false);
        } else {
          Exception exception = task.getException();
          Log.e(TAG, "sendPasswordResetEmail:onComplete:failure", exception);
          promiseRejectAuthException(promise, exception);
        }
      }
    };

    if (actionCodeSettings == null) {
      firebaseAuth.sendPasswordResetEmail(email).addOnCompleteListener(listener);
    } else {
      ActionCodeSettings settings = buildActionCodeSettings(actionCodeSettings);
      firebaseAuth.sendPasswordResetEmail(email, settings).addOnCompleteListener(listener);
    }
  }

  /* ----------------------
   *  .currentUser methods
   * ---------------------- */

  /**
   * delete
   *
   * @param promise
   */
  @ReactMethod
  public void delete(String appName, final Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

    FirebaseUser user = firebaseAuth.getCurrentUser();
    Log.d(TAG, "delete");
    if (user != null) {
      user.delete()
        .addOnCompleteListener(new OnCompleteListener<Void>() {
          @Override
          public void onComplete(@NonNull Task<Void> task) {
            if (task.isSuccessful()) {
              Log.d(TAG, "delete:onComplete:success");
              promiseNoUser(promise, false);
            } else {
              Exception exception = task.getException();
              Log.e(TAG, "delete:onComplete:failure", exception);
              promiseRejectAuthException(promise, exception);
            }
          }
        });
    } else {
      Log.e(TAG, "delete:failure:noCurrentUser");
      promiseNoUser(promise, true);
    }
  }

  /**
   * reload
   *
   * @param promise
   */
  @ReactMethod
  public void reload(String appName, final Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    final FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

    FirebaseUser user = firebaseAuth.getCurrentUser();
    Log.d(TAG, "reload");

    if (user == null) {
      promiseNoUser(promise, false);
      Log.e(TAG, "reload:failure:noCurrentUser");
    } else {
      user.reload()
        .addOnCompleteListener(new OnCompleteListener<Void>() {
          @Override
          public void onComplete(@NonNull Task<Void> task) {
            if (task.isSuccessful()) {
              Log.d(TAG, "reload:onComplete:success");
              promiseWithUser(firebaseAuth.getCurrentUser(), promise);
            } else {
              Exception exception = task.getException();
              Log.e(TAG, "reload:onComplete:failure", exception);
              promiseRejectAuthException(promise, exception);
            }
          }
        });
    }
  }

  /**
   * sendEmailVerification
   *
   * @param promise
   */
  @ReactMethod
  public void sendEmailVerification(String appName, ReadableMap actionCodeSettings, final Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    final FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

    FirebaseUser user = firebaseAuth.getCurrentUser();
    Log.d(TAG, "sendEmailVerification");

    if (user == null) {
      promiseNoUser(promise, false);
      Log.e(TAG, "sendEmailVerification:failure:noCurrentUser");
    } else {
      OnCompleteListener<Void> listener = new OnCompleteListener<Void>() {
        @Override
        public void onComplete(@NonNull Task<Void> task) {
          if (task.isSuccessful()) {
            Log.d(TAG, "sendEmailVerification:onComplete:success");
            promiseWithUser(firebaseAuth.getCurrentUser(), promise);
          } else {
            Exception exception = task.getException();
            Log.e(TAG, "sendEmailVerification:onComplete:failure", exception);
            promiseRejectAuthException(promise, exception);
          }
        }
      };

      if (actionCodeSettings == null) {
        user.sendEmailVerification().addOnCompleteListener(listener);
      } else {
        ActionCodeSettings settings = buildActionCodeSettings(actionCodeSettings);
        user.sendEmailVerification(settings).addOnCompleteListener(listener);
      }
    }
  }

  /**
   * updateEmail
   *
   * @param email
   * @param promise
   */
  @ReactMethod
  public void updateEmail(String appName, final String email, final Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    final FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

    FirebaseUser user = firebaseAuth.getCurrentUser();
    Log.d(TAG, "updateEmail");

    if (user == null) {
      promiseNoUser(promise, false);
      Log.e(TAG, "updateEmail:failure:noCurrentUser");
    } else {
      user.updateEmail(email)
        .addOnCompleteListener(new OnCompleteListener<Void>() {
          @Override
          public void onComplete(@NonNull Task<Void> task) {
            if (task.isSuccessful()) {
              Log.d(TAG, "updateEmail:onComplete:success");
              promiseWithUser(firebaseAuth.getCurrentUser(), promise);
            } else {
              Exception exception = task.getException();
              Log.e(TAG, "updateEmail:onComplete:failure", exception);
              promiseRejectAuthException(promise, exception);
            }
          }
        });
    }
  }

  /**
   * updatePassword
   *
   * @param password
   * @param promise
   */
  @ReactMethod
  public void updatePassword(String appName, final String password, final Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    final FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

    FirebaseUser user = firebaseAuth.getCurrentUser();
    Log.d(TAG, "updatePassword");

    if (user == null) {
      promiseNoUser(promise, false);
      Log.e(TAG, "updatePassword:failure:noCurrentUser");
    } else {
      user.updatePassword(password)
        .addOnCompleteListener(new OnCompleteListener<Void>() {
          @Override
          public void onComplete(@NonNull Task<Void> task) {
            if (task.isSuccessful()) {
              Log.d(TAG, "updatePassword:onComplete:success");
              promiseWithUser(firebaseAuth.getCurrentUser(), promise);
            } else {
              Exception exception = task.getException();
              Log.e(TAG, "updatePassword:onComplete:failure", exception);
              promiseRejectAuthException(promise, exception);
            }
          }
        });
    }
  }

  /**
   * updateProfile
   *
   * @param props
   * @param promise
   */
  @ReactMethod
  public void updateProfile(String appName, ReadableMap props, final Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    final FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

    FirebaseUser user = firebaseAuth.getCurrentUser();
    Log.d(TAG, "updateProfile");

    if (user == null) {
      promiseNoUser(promise, false);
      Log.e(TAG, "updateProfile:failure:noCurrentUser");
    } else {
      UserProfileChangeRequest.Builder profileBuilder = new UserProfileChangeRequest.Builder();

      if (props.hasKey("displayName")) {
        String displayName = props.getString("displayName");
        profileBuilder.setDisplayName(displayName);
      }

      if (props.hasKey("photoURL")) {
        String photoURLStr = props.getString("photoURL");
        profileBuilder.setPhotoUri(photoURLStr == null ? null : Uri.parse(photoURLStr));
      }

      UserProfileChangeRequest profileUpdates = profileBuilder.build();

      user.updateProfile(profileUpdates)
        .addOnCompleteListener(new OnCompleteListener<Void>() {
          @Override
          public void onComplete(@NonNull Task<Void> task) {
            if (task.isSuccessful()) {
              Log.d(TAG, "updateProfile:onComplete:success");
              promiseWithUser(firebaseAuth.getCurrentUser(), promise);
            } else {
              Exception exception = task.getException();
              Log.e(TAG, "updateProfile:onComplete:failure", exception);
              promiseRejectAuthException(promise, exception);
            }
          }
        });
    }
  }

  @ReactMethod
  public void signInWithCredential(String appName, String provider, String authToken, String authSecret, final Promise promise) {
    signInWithCredential(appName, provider, authToken, authSecret, promise, false);
  }

  @ReactMethod
  public void signInAndRetrieveDataWithCredential(String appName, String provider, String authToken, String authSecret, final Promise promise) {
    signInWithCredential(appName, provider, authToken, authSecret, promise, true);
  }

  public void signInWithCredential(String appName, String provider, String authToken, String authSecret, final Promise promise, final boolean withData) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

    AuthCredential credential = getCredentialForProvider(provider, authToken, authSecret);

    if (credential == null) {
      promise.reject("auth/invalid-credential", "The supplied auth credential is malformed, has expired or is not currently supported.");
    } else {
      Log.d(TAG, "signInWithCredential");
      firebaseAuth.signInWithCredential(credential)
        .addOnCompleteListener(new OnCompleteListener<AuthResult>() {
          @Override
          public void onComplete(@NonNull Task<AuthResult> task) {
            if (task.isSuccessful()) {
              Log.d(TAG, "signInWithCredential:onComplete:success");
              if (withData) {
                promiseWithAuthResult(task.getResult(), promise);
              } else {
                promiseWithUser(task.getResult().getUser(), promise);
              }
            } else {
              Exception exception = task.getException();
              Log.e(TAG, "signInWithCredential:onComplete:failure", exception);
              promiseRejectAuthException(promise, exception);
            }
          }
        });
    }
  }

  /**
   * signInWithPhoneNumber
   *
   * @param appName
   * @param phoneNumber
   */
  @ReactMethod
  public void signInWithPhoneNumber(String appName, final String phoneNumber, final Promise promise) {
    Log.d(TAG, "signInWithPhoneNumber");
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    final FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

    // Reset the verification Id
    mVerificationId = null;

    PhoneAuthProvider.getInstance(firebaseAuth).verifyPhoneNumber(phoneNumber, 60, TimeUnit.SECONDS,
      mReactContext.getCurrentActivity(), new PhoneAuthProvider.OnVerificationStateChangedCallbacks() {
        private boolean promiseResolved = false;

        @Override
        public void onVerificationCompleted(final PhoneAuthCredential phoneAuthCredential) {
          // User has been automatically verified, log them in
          firebaseAuth.signInWithCredential(phoneAuthCredential)
            .addOnCompleteListener(new OnCompleteListener<AuthResult>() {
              @Override
              public void onComplete(@NonNull Task<AuthResult> task) {
                if (task.isSuccessful()) {
                  // onAuthStateChanged will pick up the user change
                  Log.d(TAG, "signInWithPhoneNumber:autoVerified:signInWithCredential:onComplete:success");
                  // To ensure that there is no hanging promise, we resolve it with a null verificationId
                  // as calling ConfirmationResult.confirm(code) is invalid in this case anyway
                  if (!promiseResolved) {
                    WritableMap verificationMap = Arguments.createMap();
                    verificationMap.putNull("verificationId");
                    promise.resolve(verificationMap);
                  }
                } else {
                  // With phone auth, the credential will only every be rejected if the user
                  // account linked to the phone number has been disabled
                  Exception exception = task.getException();
                  Log.e(TAG, "signInWithPhoneNumber:autoVerified:signInWithCredential:onComplete:failure", exception);
                  if (promiseResolved) {
                    // In the scenario where an SMS code has been sent, we have no way to report
                    // back to the front-end that as the promise has already been used
                  } else {
                    promiseRejectAuthException(promise, exception);
                  }
                }
              }
            });
        }

        @Override
        public void onVerificationFailed(FirebaseException e) {
          // This callback is invoked in an invalid request for verification is made,
          // e.g. phone number format is incorrect, or the SMS quota for the project
          // has been exceeded
          Log.d(TAG, "signInWithPhoneNumber:verification:failed");
          promiseRejectAuthException(promise, e);
        }

        @Override
        public void onCodeSent(String verificationId, PhoneAuthProvider.ForceResendingToken forceResendingToken) {
          // TODO: This isn't being saved anywhere if the activity gets restarted when going to the SMS app
          mVerificationId = verificationId;
          WritableMap verificationMap = Arguments.createMap();
          verificationMap.putString("verificationId", verificationId);
          promise.resolve(verificationMap);
          promiseResolved = true;
        }

        @Override
        public void onCodeAutoRetrievalTimeOut(String verificationId) {
          super.onCodeAutoRetrievalTimeOut(verificationId);
          // Purposefully not doing anything with this at the moment
        }
      });
  }

  @ReactMethod
  public void _confirmVerificationCode(String appName, final String verificationCode, final Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

    PhoneAuthCredential credential = PhoneAuthProvider.getCredential(mVerificationId, verificationCode);

    firebaseAuth.signInWithCredential(credential)
      .addOnCompleteListener(new OnCompleteListener<AuthResult>() {
        @Override
        public void onComplete(@NonNull Task<AuthResult> task) {
          if (task.isSuccessful()) {
            Log.d(TAG, "_confirmVerificationCode:signInWithCredential:onComplete:success");
            promiseWithUser(task.getResult().getUser(), promise);
          } else {
            Exception exception = task.getException();
            Log.e(TAG, "_confirmVerificationCode:signInWithCredential:onComplete:failure", exception);
            promiseRejectAuthException(promise, exception);
          }
        }
      });
  }

  /**
   * verifyPhoneNumber
   *
   * @param appName
   * @param phoneNumber
   * @param timeout
   */
  @ReactMethod
  public void verifyPhoneNumber(final String appName, final String phoneNumber, final String requestKey, final int timeout) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    final FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);
    final Activity activity = mReactContext.getCurrentActivity();

    Log.d(TAG, "verifyPhoneNumber:" + phoneNumber);

    // Reset the credential
    mCredential = null;

    PhoneAuthProvider.OnVerificationStateChangedCallbacks callbacks = new PhoneAuthProvider.OnVerificationStateChangedCallbacks() {

      @Override
      public void onVerificationCompleted(final PhoneAuthCredential phoneAuthCredential) {
        // Cache the credential to protect against null verificationId
        mCredential = phoneAuthCredential;

        Log.d(TAG, "verifyPhoneNumber:verification:onVerificationCompleted");
        WritableMap state = Arguments.createMap();

        Parcel parcel = Parcel.obtain();
        phoneAuthCredential.writeToParcel(parcel, 0);

        // verificationId
        parcel.setDataPosition(16);
        String verificationId = parcel.readString();

        // sms Code
        parcel.setDataPosition(parcel.dataPosition() + 8);
        String code = parcel.readString();

        state.putString("code", code);
        state.putString("verificationId", verificationId);
        parcel.recycle();
        sendPhoneStateEvent(appName, requestKey, "onVerificationComplete", state);
      }

      @Override
      public void onVerificationFailed(FirebaseException e) {
        // This callback is invoked in an invalid request for verification is made,
        // e.g. phone number format is incorrect, or the SMS quota for the project
        // has been exceeded
        Log.d(TAG, "verifyPhoneNumber:verification:onVerificationFailed");
        WritableMap state = Arguments.createMap();
        state.putMap("error", getJSError(e));
        sendPhoneStateEvent(appName, requestKey, "onVerificationFailed", state);
      }

      @Override
      public void onCodeSent(String verificationId, PhoneAuthProvider.ForceResendingToken forceResendingToken) {
        Log.d(TAG, "verifyPhoneNumber:verification:onCodeSent");
        WritableMap state = Arguments.createMap();
        state.putString("verificationId", verificationId);

        // todo forceResendingToken  - it's actually just an empty class ... no actual token >.>
        // Parcel parcel = Parcel.obtain();
        // forceResendingToken.writeToParcel(parcel, 0);
        //
        // // verificationId
        // parcel.setDataPosition(0);
        // int int1 = parcel.readInt();
        // String token = parcel.readString();
        //
        // state.putString("refreshToken", token);
        // parcel.recycle();

        state.putString("verificationId", verificationId);
        sendPhoneStateEvent(appName, requestKey, "onCodeSent", state);
      }

      @Override
      public void onCodeAutoRetrievalTimeOut(String verificationId) {
        super.onCodeAutoRetrievalTimeOut(verificationId);
        Log.d(TAG, "verifyPhoneNumber:verification:onCodeAutoRetrievalTimeOut");
        WritableMap state = Arguments.createMap();
        state.putString("verificationId", verificationId);
        sendPhoneStateEvent(appName, requestKey, "onCodeAutoRetrievalTimeout", state);
      }
    };

    if (activity != null) {
      PhoneAuthProvider.getInstance(firebaseAuth)
        .verifyPhoneNumber(
          phoneNumber,
          timeout,
          TimeUnit.SECONDS,
          activity,
          callbacks
          //, PhoneAuthProvider.ForceResendingToken.zzboe() // TODO FORCE RESENDING
        );
    }
  }

  /**
   * confirmPasswordReset
   *
   * @param code
   * @param newPassword
   * @param promise
   */
  @ReactMethod
  public void confirmPasswordReset(String appName, String code, String newPassword, final Promise promise) {
    Log.d(TAG, "confirmPasswordReset");

    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

    firebaseAuth.confirmPasswordReset(code, newPassword)
      .addOnCompleteListener(new OnCompleteListener<Void>() {
        @Override
        public void onComplete(@NonNull Task<Void> task) {
          if (task.isSuccessful()) {
            Log.d(TAG, "confirmPasswordReset:onComplete:success");
            promiseNoUser(promise, false);
          } else {
            Exception exception = task.getException();
            Log.e(TAG, "confirmPasswordReset:onComplete:failure", exception);
            promiseRejectAuthException(promise, exception);
          }
        }
      });
  }

  /**
   * applyActionCode
   *
   * @param code
   * @param promise
   */
  @ReactMethod
  public void applyActionCode(String appName, String code, final Promise promise) {
    Log.d(TAG, "applyActionCode");

    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

    firebaseAuth.applyActionCode(code).addOnCompleteListener(new OnCompleteListener<Void>() {
      @Override
      public void onComplete(@NonNull Task<Void> task) {
        if (task.isSuccessful()) {
          Log.d(TAG, "applyActionCode:onComplete:success");
          promiseNoUser(promise, false);
        } else {
          Exception exception = task.getException();
          Log.e(TAG, "applyActionCode:onComplete:failure", exception);
          promiseRejectAuthException(promise, exception);
        }
      }
    });
  }

  /**
   * @param code
   * @param promise
   */
  @ReactMethod
  public void checkActionCode(String appName, String code, final Promise promise) {
    Log.d(TAG, "checkActionCode");

    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

    firebaseAuth.checkActionCode(code).addOnCompleteListener(new OnCompleteListener<ActionCodeResult>() {
      @Override
      public void onComplete(@NonNull Task<ActionCodeResult> task) {
        if (task.isSuccessful()) {
          Log.d(TAG, "checkActionCode:onComplete:success");
          ActionCodeResult result = task.getResult();

          WritableMap writableMap = Arguments.createMap();
          WritableMap dataMap = Arguments.createMap();

          dataMap.putString("email", result.getData(ActionCodeResult.EMAIL));
          dataMap.putString("fromEmail", result.getData(ActionCodeResult.FROM_EMAIL));

          writableMap.putMap("data", dataMap);

          String actionType = "UNKNOWN";

          switch (result.getOperation()) {
            case ActionCodeResult.ERROR:
              actionType = "ERROR";
              break;
            case ActionCodeResult.VERIFY_EMAIL:
              actionType = "VERIFY_EMAIL";
              break;
            case ActionCodeResult.RECOVER_EMAIL:
              actionType = "RECOVER_EMAIL";
              break;
            case ActionCodeResult.PASSWORD_RESET:
              actionType = "PASSWORD_RESET";
              break;
          }

          writableMap.putString("actionType", actionType);

          promise.resolve(writableMap);
        } else {
          Exception exception = task.getException();
          Log.e(TAG, "checkActionCode:onComplete:failure", exception);
          promiseRejectAuthException(promise, exception);
        }
      }
    });
  }

  /**
   * linkWithCredential
   *
   * @param provider
   * @param authToken
   * @param authSecret
   * @param promise
   */
  @ReactMethod
  public void linkWithCredential(String appName, String provider, String authToken, String authSecret, final Promise promise) {
    link(appName, provider, authToken, authSecret, promise, false);
  }

  @ReactMethod
  public void linkAndRetrieveDataWithCredential(String appName, String provider, String authToken, String authSecret, final Promise promise) {
    link(appName, provider, authToken, authSecret, promise, true);
  }

  private void link(String appName, String provider, String authToken, String authSecret, final Promise promise, final boolean withData) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

    AuthCredential credential = getCredentialForProvider(provider, authToken, authSecret);

    if (credential == null) {
      promise.reject("auth/invalid-credential", "The supplied auth credential is malformed, has expired or is not currently supported.");
    } else {
      FirebaseUser user = firebaseAuth.getCurrentUser();
      Log.d(TAG, "link");

      if (user != null) {
        user.linkWithCredential(credential)
          .addOnCompleteListener(new OnCompleteListener<AuthResult>() {
            @Override
            public void onComplete(@NonNull Task<AuthResult> task) {
              if (task.isSuccessful()) {
                Log.d(TAG, "link:onComplete:success");
                if (withData) {
                  promiseWithAuthResult(task.getResult(), promise);
                } else {
                  promiseWithUser(task.getResult().getUser(), promise);
                }
              } else {
                Exception exception = task.getException();
                Log.e(TAG, "link:onComplete:failure", exception);
                promiseRejectAuthException(promise, exception);
              }
            }
          });
      } else {
        promiseNoUser(promise, true);
      }
    }
  }

  @ReactMethod
  public void unlink(final String appName, final String providerId, final Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);
    FirebaseUser user = firebaseAuth.getCurrentUser();
    Log.d(TAG, "unlink");

    if (user != null) {
      user.unlink(providerId)
        .addOnCompleteListener(new OnCompleteListener<AuthResult>() {
          @Override
          public void onComplete(@NonNull Task<AuthResult> task) {
            if (task.isSuccessful()) {
              Log.d(TAG, "unlink:onComplete:success");
              promiseWithUser(task.getResult().getUser(), promise);
            } else {
              Exception exception = task.getException();
              Log.e(TAG, "unlink:onComplete:failure", exception);
              promiseRejectAuthException(promise, exception);
            }
          }
        });
    } else {
      promiseNoUser(promise, true);
    }
  }

  @ReactMethod
  public void reauthenticateWithCredential(String appName, String provider, String authToken, String authSecret, final Promise promise) {
    reauthenticate(appName, provider, authToken, authSecret, promise, false);
  }

  @ReactMethod
  public void reauthenticateAndRetrieveDataWithCredential(String appName, String provider, String authToken, String authSecret, final Promise promise) {
    reauthenticate(appName, provider, authToken, authSecret, promise, true);
  }

  public void reauthenticate(String appName, String provider, String authToken, String authSecret, final Promise promise, final boolean withData) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    final FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

    AuthCredential credential = getCredentialForProvider(provider, authToken, authSecret);

    if (credential == null) {
      promise.reject("auth/invalid-credential", "The supplied auth credential is malformed, has expired or is not currently supported.");
    } else {
      FirebaseUser user = firebaseAuth.getCurrentUser();
      Log.d(TAG, "reauthenticate");

      if (user != null) {
        user.reauthenticateAndRetrieveData(credential)
          .addOnCompleteListener(new OnCompleteListener<AuthResult>() {
            @Override
            public void onComplete(@NonNull Task<AuthResult> task) {
              if (task.isSuccessful()) {
                Log.d(TAG, "reauthenticate:onComplete:success");
                if (withData) {
                  promiseWithAuthResult(task.getResult(), promise);
                } else {
                  promiseWithUser(task.getResult().getUser(), promise);
                }
              } else {
                Exception exception = task.getException();
                Log.e(TAG, "reauthenticate:onComplete:failure", exception);
                promiseRejectAuthException(promise, exception);
              }
            }
          });
      } else {
        promiseNoUser(promise, true);
      }
    }
  }

  /**
   * Returns an instance of AuthCredential for the specified provider
   */
  private AuthCredential getCredentialForProvider(String provider, String authToken, String authSecret) {
    switch (provider) {
      case "facebook.com":
        return FacebookAuthProvider.getCredential(authToken);
      case "google.com":
        return GoogleAuthProvider.getCredential(authToken, authSecret);
      case "twitter.com":
        return TwitterAuthProvider.getCredential(authToken, authSecret);
      case "github.com":
        return GithubAuthProvider.getCredential(authToken);
      case "oauth":
        return OAuthProvider.getCredential(provider, authToken, authSecret);
      case "phone":
        // If the phone number is auto-verified quickly, then the verificationId can be null
        // We cached the credential as part of the verifyPhoneNumber request to be re-used here
        // if possible
        if (authToken == null && mCredential != null) {
          PhoneAuthCredential credential = mCredential;
          // Reset the cached credential
          mCredential = null;
          return credential;
        }
        return PhoneAuthProvider.getCredential(authToken, authSecret);
      case "password":
        return EmailAuthProvider.getCredential(authToken, authSecret);
      default:
        return null;
    }
  }

  @ReactMethod
  public void getToken(String appName, Boolean forceRefresh, final Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

    FirebaseUser user = firebaseAuth.getCurrentUser();
    Log.d(TAG, "getToken/getIdToken");

    if (user != null) {
      user.getIdToken(forceRefresh)
        .addOnCompleteListener(new OnCompleteListener<GetTokenResult>() {
          @Override
          public void onComplete(@NonNull Task<GetTokenResult> task) {
            if (task.isSuccessful()) {
              Log.d(TAG, "getToken:onComplete:success");
              promise.resolve(task.getResult().getToken());
            } else {
              Exception exception = task.getException();
              Log.e(TAG, "getToken:onComplete:failure", exception);
              promiseRejectAuthException(promise, exception);
            }
          }
        });
    } else {
      promiseNoUser(promise, true);
    }
  }

  @ReactMethod
  public void fetchProvidersForEmail(String appName, String email, final Promise promise) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

    Log.d(TAG, "fetchProvidersForEmail");

    firebaseAuth.fetchProvidersForEmail(email)
      .addOnCompleteListener(new OnCompleteListener<ProviderQueryResult>() {
        @Override
        public void onComplete(@NonNull Task<ProviderQueryResult> task) {
          if (task.isSuccessful()) {
            Log.d(TAG, "fetchProvidersForEmail:onComplete:success");
            List<String> providers = task.getResult().getProviders();
            WritableArray array = Arguments.createArray();

            if (providers != null) {
              for (String provider : providers) {
                array.pushString(provider);
              }
            }

            promise.resolve(array);
          } else {
            Exception exception = task.getException();
            Log.d(TAG, "fetchProvidersForEmail:onComplete:failure", exception);
            promiseRejectAuthException(promise, exception);
          }
        }
      });
  }

  @ReactMethod
  public void setLanguageCode(String appName, String code) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

    firebaseAuth.setLanguageCode(code);
  }

  @ReactMethod
  public void useDeviceLanguage(String appName) {
    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

    firebaseAuth.useAppLanguage();
  }

  @ReactMethod
  public void verifyPasswordResetCode(String appName, String code, final Promise promise) {
    Log.d(TAG, "verifyPasswordResetCode");

    FirebaseApp firebaseApp = FirebaseApp.getInstance(appName);
    FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

    firebaseAuth.verifyPasswordResetCode(code).addOnCompleteListener(new OnCompleteListener<String>() {
      @Override
      public void onComplete(@NonNull Task<String> task) {
        if (task.isSuccessful()) {
          Log.d(TAG, "verifyPasswordResetCode:onComplete:success");
          promise.resolve(task.getResult());
        } else {
          Exception exception = task.getException();
          Log.e(TAG, "verifyPasswordResetCode:onComplete:failure", exception);
          promiseRejectAuthException(promise, exception);
        }
      }
    });
  }

  /* ------------------
   * INTERNAL HELPERS
   * ---------------- */

  /**
   * Resolves or rejects an auth method promise without a user (user was missing)
   *
   * @param promise
   * @param isError
   */
  private void promiseNoUser(Promise promise, Boolean isError) {
    if (isError) {
      promise.reject("auth/no-current-user", "No user currently signed in.");
    } else {
      promise.resolve(null);
    }
  }

  /**
   * promiseWithUser
   *
   * @param user
   * @param promise
   */
  private void promiseWithUser(final FirebaseUser user, final Promise promise) {
    if (user != null) {
      WritableMap userMap = firebaseUserToMap(user);
      promise.resolve(userMap);
    } else {
      promiseNoUser(promise, true);
    }
  }

  /**
   * promiseWithAuthResult
   *
   * @param authResult
   * @param promise
   */
  private void promiseWithAuthResult(AuthResult authResult, Promise promise) {
    if (authResult != null && authResult.getUser() != null) {
      WritableMap userMap = firebaseUserToMap(authResult.getUser());
      WritableMap authResultMap = Arguments.createMap();
      if (authResult.getAdditionalUserInfo() != null) {
        WritableMap additionalUserInfoMap = Arguments.createMap();
        additionalUserInfoMap.putBoolean("isNewUser", authResult.getAdditionalUserInfo().isNewUser());
        if (authResult.getAdditionalUserInfo().getProfile() != null) {
          WritableMap profileMap = mapToWritableMap(authResult.getAdditionalUserInfo().getProfile());
          additionalUserInfoMap.putMap("profile", profileMap);
        }
        if (authResult.getAdditionalUserInfo().getProviderId() != null) {
          additionalUserInfoMap.putString("providerId", authResult.getAdditionalUserInfo().getProviderId());
        }
        if (authResult.getAdditionalUserInfo().getUsername() != null) {
          additionalUserInfoMap.putString("username", authResult.getAdditionalUserInfo().getUsername());
        }
        authResultMap.putMap("additionalUserInfo", additionalUserInfoMap);
      }
      authResultMap.putMap("user", userMap);
      promise.resolve(authResultMap);
    } else {
      promiseNoUser(promise, true);
    }
  }

  private WritableMap mapToWritableMap(Map<String, Object> map) {
    WritableMap writableMap = Arguments.createMap();
    for (String key : map.keySet()) {
      Object value = map.get(key);
      if (value == null) {
        writableMap.putNull(key);
      } else if (value instanceof Boolean) {
        writableMap.putBoolean(key, (Boolean) value);
      } else if (value instanceof Integer) {
        writableMap.putDouble(key, ((Integer) value).doubleValue());
      } else if (value instanceof Long) {
        writableMap.putDouble(key, ((Long) value).doubleValue());
      } else if (value instanceof Double) {
        writableMap.putDouble(key, (Double) value);
      } else if (value instanceof Float) {
        writableMap.putDouble(key, ((Float) value).doubleValue());
      } else if (value instanceof String) {
        writableMap.putString(key, (String) value);
      } else if (Map.class.isAssignableFrom(value.getClass())) {
        writableMap.putMap(key, mapToWritableMap((Map<String, Object>) value));
      } else if (List.class.isAssignableFrom(value.getClass())) {
        writableMap.putArray(key, listToWritableArray((List<Object>) value));
      } else {
        Log.e(TAG, "mapToWritableMap: Cannot convert object of type " + value.getClass());
      }
    }

    return writableMap;
  }

  private WritableArray listToWritableArray(List<Object> list) {
    WritableArray writableArray = Arguments.createArray();
    for (Object item : list) {
      if (item == null) {
        writableArray.pushNull();
      } else if (item instanceof Boolean) {
        writableArray.pushBoolean((Boolean) item);
      } else if (item instanceof Integer) {
        writableArray.pushDouble(((Integer) item).doubleValue());
      } else if (item instanceof Long) {
        writableArray.pushDouble(((Long) item).doubleValue());
      } else if (item instanceof Double) {
        writableArray.pushDouble((Double) item);
      } else if (item instanceof Float) {
        writableArray.pushDouble(((Float) item).doubleValue());
      } else if (item instanceof String) {
        writableArray.pushString((String) item);
      } else if (Map.class.isAssignableFrom(item.getClass())) {
        writableArray.pushMap(mapToWritableMap((Map<String, Object>) item));
      } else if (List.class.isAssignableFrom(item.getClass())) {
        writableArray.pushArray(listToWritableArray((List<Object>) item));
      } else {
        Log.e(TAG, "listToWritableArray: Cannot convert object of type " + item.getClass());
      }
    }
    return writableArray;
  }


  /**
   * promiseRejectAuthException
   *
   * @param promise
   * @param exception
   */
  private void promiseRejectAuthException(Promise promise, Exception exception) {
    WritableMap error = getJSError(exception);
    promise.reject(error.getString("code"), error.getString("message"), exception);
  }

  /**
   * getJSError
   *
   * @param exception
   */
  private WritableMap getJSError(Exception exception) {
    WritableMap error = Arguments.createMap();
    String code = "UNKNOWN";
    String message = exception.getMessage();
    String invalidEmail = "The email address is badly formatted.";

    try {
      FirebaseAuthException authException = (FirebaseAuthException) exception;
      code = authException.getErrorCode();
      error.putString("nativeErrorCode", code);
      message = authException.getMessage();
    } catch (Exception e) {
      Matcher matcher = Pattern.compile("\\[(.*):.*\\]").matcher(message);
      if (matcher.find()) {
        code = matcher.group(1).trim();
        switch (code) {
          case "INVALID_CUSTOM_TOKEN":
            message = "The custom token format is incorrect. Please check the documentation.";
            break;
          case "CUSTOM_TOKEN_MISMATCH":
            message = "The custom token corresponds to a different audience.";
            break;
          case "INVALID_CREDENTIAL":
            message = "The supplied auth credential is malformed or has expired.";
            break;
          case "INVALID_EMAIL":
            message = invalidEmail;
            break;
          case "WRONG_PASSWORD":
            message = "The password is invalid or the user does not have a password.";
            break;
          case "USER_MISMATCH":
            message = "The supplied credentials do not correspond to the previously signed in user.";
            break;
          case "REQUIRES_RECENT_LOGIN":
            message = "This operation is sensitive and requires recent authentication. Log in again before retrying this request.";
            break;
          case "ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL":
            message = "An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.";
            break;
          case "EMAIL_ALREADY_IN_USE":
            message = "The email address is already in use by another account.";
            break;
          case "CREDENTIAL_ALREADY_IN_USE":
            message = "This credential is already associated with a different user account.";
            break;
          case "USER_DISABLED":
            message = "The user account has been disabled by an administrator.";
            break;
          case "USER_TOKEN_EXPIRED":
            message = "The user\'s credential is no longer valid. The user must sign in again.";
            break;
          case "USER_NOT_FOUND":
            message = "There is no user record corresponding to this identifier. The user may have been deleted.";
            break;
          case "INVALID_USER_TOKEN":
            message = "The user\'s credential is no longer valid. The user must sign in again.";
            break;
          case "WEAK_PASSWORD":
            message = "The given password is invalid.";
            break;
          case "OPERATION_NOT_ALLOWED":
            message = "This operation is not allowed. You must enable this service in the console.";
            break;
        }
      }
    }

    if (code.equals("UNKNOWN") && exception instanceof FirebaseAuthInvalidCredentialsException) {
      code = "INVALID_EMAIL";
      message = invalidEmail;
    }

    code = "auth/" + code.toLowerCase().replace("error_", "").replace('_', '-');
    error.putString("code", code);
    error.putString("message", message);
    error.putString("nativeErrorMessage", exception.getMessage());
    return error;
  }


  /**
   * Converts a List of UserInfo instances into the correct format to match the web sdk
   *
   * @param providerData List<UserInfo> user.getProviderData()
   * @return WritableArray array
   */
  private WritableArray convertProviderData(List<? extends UserInfo> providerData, FirebaseUser user) {
    WritableArray output = Arguments.createArray();
    for (UserInfo userInfo : providerData) {
      // remove 'firebase' provider data - android fb sdk
      // should not be returning this as the ios/web ones don't
      if (!FirebaseAuthProvider.PROVIDER_ID.equals(userInfo.getProviderId())) {
        WritableMap userInfoMap = Arguments.createMap();
        userInfoMap.putString("providerId", userInfo.getProviderId());
        userInfoMap.putString("uid", userInfo.getUid());
        userInfoMap.putString("displayName", userInfo.getDisplayName());

        final Uri photoUrl = userInfo.getPhotoUrl();

        if (photoUrl != null && !"".equals(photoUrl)) {
          userInfoMap.putString("photoURL", photoUrl.toString());
        } else {
          userInfoMap.putNull("photoURL");
        }

        final String phoneNumber = userInfo.getPhoneNumber();
        // The Android SDK is missing the phone number property for the phone provider when the
        // user first signs up using their phone number.  Use the phone number from the user
        // object instead
        if (PhoneAuthProvider.PROVIDER_ID.equals(userInfo.getProviderId())
          && (userInfo.getPhoneNumber() == null || "".equals(userInfo.getPhoneNumber()))) {
          userInfoMap.putString("phoneNumber", user.getPhoneNumber());
        } else if (phoneNumber != null && !"".equals(phoneNumber)) {
          userInfoMap.putString("phoneNumber", phoneNumber);
        } else {
          userInfoMap.putNull("phoneNumber");
        }

        // The Android SDK is missing the email property for the email provider, so we use UID instead
        if (EmailAuthProvider.PROVIDER_ID.equals(userInfo.getProviderId())
          && (userInfo.getEmail() == null || "".equals(userInfo.getEmail()))) {
          userInfoMap.putString("email", userInfo.getUid());
        } else if (userInfo.getEmail() != null && !"".equals(userInfo.getEmail())) {
          userInfoMap.putString("email", userInfo.getEmail());
        } else {
          userInfoMap.putNull("email");
        }

        output.pushMap(userInfoMap);
      }
    }

    return output;
  }

  /**
   * firebaseUserToMap
   *
   * @param user
   * @return
   */
  private WritableMap firebaseUserToMap(FirebaseUser user) {
    WritableMap userMap = Arguments.createMap();

    final String uid = user.getUid();
    final String email = user.getEmail();
    final Uri photoUrl = user.getPhotoUrl();
    final String name = user.getDisplayName();
    final String provider = user.getProviderId();
    final Boolean verified = user.isEmailVerified();
    final String phoneNumber = user.getPhoneNumber();

    userMap.putString("uid", uid);
    userMap.putString("providerId", provider);
    userMap.putBoolean("emailVerified", verified);
    userMap.putBoolean("isAnonymous", user.isAnonymous());

    if (email != null && !"".equals(email)) {
      userMap.putString("email", email);
    } else {
      userMap.putNull("email");
    }

    if (name != null && !"".equals(name)) {
      userMap.putString("displayName", name);
    } else {
      userMap.putNull("displayName");
    }

    if (photoUrl != null && !"".equals(photoUrl)) {
      userMap.putString("photoURL", photoUrl.toString());
    } else {
      userMap.putNull("photoURL");
    }

    if (phoneNumber != null && !"".equals(phoneNumber)) {
      userMap.putString("phoneNumber", phoneNumber);
    } else {
      userMap.putNull("phoneNumber");
    }

    userMap.putArray("providerData", convertProviderData(user.getProviderData(), user));

    WritableMap metadataMap = Arguments.createMap();
    FirebaseUserMetadata metadata = user.getMetadata();
    if (metadata != null) {
      metadataMap.putDouble("creationTime", metadata.getCreationTimestamp());
      metadataMap.putDouble("lastSignInTime", metadata.getLastSignInTimestamp());
    }
    userMap.putMap("metadata", metadataMap);

    return userMap;
  }

  private ActionCodeSettings buildActionCodeSettings(ReadableMap actionCodeSettings) {
    ActionCodeSettings.Builder builder = ActionCodeSettings.newBuilder();
    ReadableMap android = actionCodeSettings.getMap("android");
    ReadableMap ios = actionCodeSettings.getMap("iOS");
    String url = actionCodeSettings.getString("url");
    if (android != null) {
      boolean installApp = android.hasKey("installApp") ? android.getBoolean("installApp") : false;
      String minimumVersion = android.hasKey("minimumVersion") ? android.getString("minimumVersion") : null;
      String packageName = android.getString("packageName");
      builder = builder.setAndroidPackageName(packageName, installApp, minimumVersion);
    }
    if (actionCodeSettings.hasKey("handleCodeInApp")) {
      builder = builder.setHandleCodeInApp(actionCodeSettings.getBoolean("handleCodeInApp"));
    }
    if (ios != null && ios.hasKey("bundleId")) {
      builder = builder.setIOSBundleId(ios.getString("bundleId"));
    }
    if (url != null) {
      builder = builder.setUrl(url);
    }

    return builder.build();
  }

  /**
   * @param appName
   * @param requestKey
   * @param type
   * @param state
   */
  private void sendPhoneStateEvent(String appName, String requestKey, String type, WritableMap state) {
    WritableMap eventMap = Arguments.createMap();
    eventMap.putString("appName", appName);
    eventMap.putString("requestKey", requestKey);
    eventMap.putString("type", type);
    eventMap.putMap("state", state);
    Utils.sendEvent(mReactContext, "phone_auth_state_changed", eventMap);
  }

  /**
   * Constants bootstrapped on react native app boot
   *
   * @return
   */
  @Override
  public Map<String, Object> getConstants() {
    Map<String, Object> constants = new HashMap<>();

    List<FirebaseApp> firebaseAppList = FirebaseApp.getApps(getReactApplicationContext());
    final Map<String, Object> appLanguage = new HashMap<>();

    for (FirebaseApp app : firebaseAppList) {
      String appName = app.getName();

      FirebaseApp instance = FirebaseApp.getInstance(appName);
      FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(instance);

      appLanguage.put(appName, firebaseAuth.getLanguageCode());
    }

    constants.put("APP_LANGUAGE", appLanguage);
    return constants;
  }
}
