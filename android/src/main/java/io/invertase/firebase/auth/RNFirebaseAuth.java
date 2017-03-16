package io.invertase.firebase.auth;

import android.util.Log;
import android.net.Uri;
import android.support.annotation.NonNull;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReactContext;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;

import com.google.firebase.auth.AuthCredential;
import com.google.firebase.auth.AuthResult;
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
public class RNFirebaseAuth extends ReactContextBaseJavaModule {
  private final int NO_CURRENT_USER = 100;
  private final int ERROR_FETCHING_TOKEN = 101;
  private final int ERROR_SENDING_VERIFICATION_EMAIL = 102;

  private static final String TAG = "RNFirebaseAuth";

  private ReactContext mReactContext;
  private FirebaseAuth mAuth;
  private FirebaseAuth.AuthStateListener mAuthListener;

  public RNFirebaseAuth(ReactApplicationContext reactContext) {
    super(reactContext);
    mReactContext = reactContext;
    mAuth = FirebaseAuth.getInstance();
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
  public void addAuthStateListener() {
    Log.d(TAG, "addAuthStateListener");
    if (mAuthListener == null) {
      mAuthListener = new FirebaseAuth.AuthStateListener() {
        @Override
        public void onAuthStateChanged(@NonNull FirebaseAuth firebaseAuth) {
          FirebaseUser user = firebaseAuth.getCurrentUser();
          WritableMap msgMap = Arguments.createMap();
          msgMap.putString("eventName", "onAuthStateChanged");
          if (user != null) {
            msgMap.putBoolean("authenticated", true);
            msgMap.putMap("user", firebaseUserToMap(user));
            Utils.sendEvent(mReactContext, "onAuthStateChanged", msgMap);
          } else {
            msgMap.putBoolean("authenticated", false);
            Utils.sendEvent(mReactContext, "onAuthStateChanged", msgMap);
          }
        }
      };
      mAuth.addAuthStateListener(mAuthListener);
    }
  }

  /**
   * Removes the current auth state listener
   */
  @ReactMethod
  public void removeAuthStateListener() {
    Log.d(TAG, "removeAuthStateListener");
    if (mAuthListener != null) {
      mAuth.removeAuthStateListener(mAuthListener);
    }
  }

  /**
   * signOut
   *
   * @param promise
   */
  @ReactMethod
  public void signOut(final Promise promise) {
    Log.d(TAG, "signOut");
    if (mAuth == null || mAuth.getCurrentUser() == null) {
      promiseNoUser(promise, true);
    } else {
      mAuth.signOut();
      promiseNoUser(promise, false);
    }
  }

  /**
   * signInAnonymously
   *
   * @param promise
   */
  @ReactMethod
  public void signInAnonymously(final Promise promise) {
    Log.d(TAG, "signInAnonymously");
    mAuth.signInAnonymously()
      .addOnSuccessListener(new OnSuccessListener<AuthResult>() {
        @Override
        public void onSuccess(AuthResult authResult) {
          Log.d(TAG, "signInAnonymously:onComplete:success");
          promiseWithUser(authResult.getUser(), promise);
        }
      })
      .addOnFailureListener(new OnFailureListener() {
        @Override
        public void onFailure(@NonNull Exception exception) {
          WritableMap error = authExceptionToMap(exception);
          Log.e(TAG, "signInAnonymously:onComplete:failure", exception);
          promise.reject(error.getString("code"), error.getString("message"), exception);
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
  public void createUserWithEmailAndPassword(final String email, final String password, final Promise promise) {
    Log.d(TAG, "createUserWithEmailAndPassword");
    mAuth.createUserWithEmailAndPassword(email, password)
      .addOnSuccessListener(new OnSuccessListener<AuthResult>() {
        @Override
        public void onSuccess(AuthResult authResult) {
          Log.d(TAG, "createUserWithEmailAndPassword:onComplete:success");
          promiseWithUser(authResult.getUser(), promise);
        }
      })
      .addOnFailureListener(new OnFailureListener() {
        @Override
        public void onFailure(@NonNull Exception exception) {
          WritableMap error = authExceptionToMap(exception);
          Log.e(TAG, "createUserWithEmailAndPassword:onComplete:failure", exception);
          promise.reject(error.getString("code"), error.getString("message"), exception);
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
  public void signInWithEmailAndPassword(final String email, final String password, final Promise promise) {
    Log.d(TAG, "signInWithEmailAndPassword");
    mAuth.signInWithEmailAndPassword(email, password)
      .addOnSuccessListener(new OnSuccessListener<AuthResult>() {
        @Override
        public void onSuccess(AuthResult authResult) {
          Log.d(TAG, "signInWithEmailAndPassword:onComplete:success");
          promiseWithUser(authResult.getUser(), promise);
        }
      })
      .addOnFailureListener(new OnFailureListener() {
        @Override
        public void onFailure(@NonNull Exception exception) {
          WritableMap error = authExceptionToMap(exception);
          Log.e(TAG, "signInWithEmailAndPassword:onComplete:failure", exception);
          promise.reject(error.getString("code"), error.getString("message"), exception);
        }
      });
  }


  /**
   * signInWithCustomToken
   *
   * @param token
   * @param promise
   */
  @ReactMethod
  public void signInWithCustomToken(final String token, final Promise promise) {
    Log.d(TAG, "signInWithCustomToken");
    mAuth.signInWithCustomToken(token)
      .addOnSuccessListener(new OnSuccessListener<AuthResult>() {
        @Override
        public void onSuccess(AuthResult authResult) {
          Log.d(TAG, "signInWithCustomToken:onComplete:success");
          promiseWithUser(authResult.getUser(), promise);
        }
      })
      .addOnFailureListener(new OnFailureListener() {
        @Override
        public void onFailure(@NonNull Exception exception) {
          WritableMap error = authExceptionToMap(exception);
          Log.e(TAG, "signInWithCustomToken:onComplete:failure", exception);
          promise.reject(error.getString("code"), error.getString("message"), exception);
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
  public void sendPasswordResetEmail(final String email, final Promise promise) {
    Log.d(TAG, "sendPasswordResetEmail");
    mAuth.sendPasswordResetEmail(email)
      .addOnCompleteListener(new OnCompleteListener<Void>() {
        @Override
        public void onComplete(@NonNull Task<Void> task) {
          if (task.isSuccessful()) {
            Log.d(TAG, "sendPasswordResetEmail:onComplete:success");
            promiseNoUser(promise, false);
          } else {
            Exception exception = task.getException();
            WritableMap error = authExceptionToMap(exception);
            Log.e(TAG, "sendPasswordResetEmail:onComplete:failure", exception);
            promise.reject(error.getString("code"), error.getString("message"), exception);
          }
        }
      });
  }

  /**
   * getCurrentUser - returns the current user, probably no need for this due to
   * js side already listening for user auth changes
   *
   * @param promise
   */
  @ReactMethod
  public void getCurrentUser(final Promise promise) {
    FirebaseUser user = mAuth.getCurrentUser();
    Log.d(TAG, "getCurrentUser");
    if (user == null) {
      promiseNoUser(promise, false);
    } else {
      promiseWithUser(user, promise);
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
  public void delete(final Promise promise) {
    FirebaseUser user = mAuth.getCurrentUser();
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
              WritableMap error = authExceptionToMap(exception);
              Log.e(TAG, "delete:onComplete:failure", exception);
              promise.reject(error.getString("code"), error.getString("message"), exception);
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
  public void reload(final Promise promise) {
    FirebaseUser user = mAuth.getCurrentUser();
    Log.d(TAG, "delete");

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
              promiseWithUser(mAuth.getCurrentUser(), promise);
            } else {
              Exception exception = task.getException();
              WritableMap error = authExceptionToMap(exception);
              Log.e(TAG, "reload:onComplete:failure", exception);
              promise.reject(error.getString("code"), error.getString("message"), exception);
            }
          }
        });
    }
  }


  /**
   * signInWithCredential
   * TODO
   *
   * @param provider
   * @param authToken
   * @param authSecret
   * @param promise
   */
  @ReactMethod
  public void signInWithCredential(final String provider, final String authToken, final String authSecret, final Promise promise) {
    switch (provider) {
      case "facebook":
        //facebookLogin(authToken, callback);
        break;
      case "google":
        //googleLogin(authToken, callback);
      default:
        promise.reject("auth/invalid_provider", "The provider specified is invalid.");
    }
  }

  /**
   * link
   *
   * @param provider
   * @param authToken
   * @param authSecret
   * @param promise
   */
  @ReactMethod
  public void link(final String provider, final String authToken, final String authSecret, final Promise promise) {
    if (provider.equals("password")) {
      linkPassword(authToken, authSecret, promise);
    } else
      promise.reject("auth/todo", "Method currently not implemented.");
  }

  /**
   * linkPassword
   *
   * @param email
   * @param password
   * @param promise
   */
  @ReactMethod
  public void linkPassword(final String email, final String password, final Promise promise) {
    FirebaseUser user = mAuth.getCurrentUser();
    Log.d(TAG, "linkPassword");

    if (user != null) {
      AuthCredential credential = EmailAuthProvider.getCredential(email, password);
      user.linkWithCredential(credential)
        .addOnCompleteListener(new OnCompleteListener<AuthResult>() {
          @Override
          public void onComplete(@NonNull Task<AuthResult> task) {
            if (task.isSuccessful()) {
              Log.d(TAG, "linkPassword:onComplete:success");
              promiseWithUser(mAuth.getCurrentUser(), promise);
            } else {
              Exception exception = task.getException();
              WritableMap error = authExceptionToMap(exception);
              Log.e(TAG, "linkPassword:onComplete:failure", exception);
              promise.reject(error.getString("code"), error.getString("message"), exception);
            }
          }
        });
    } else {
      promiseNoUser(promise, true);
    }
  }

  /**
   * getToken
   *
   * @param promise
   */
  @ReactMethod
  public void getToken(final Promise promise) {
    FirebaseUser user = mAuth.getCurrentUser();
    Log.d(TAG, "getToken");

    if (user != null) {
      user.getToken(true)
        .addOnCompleteListener(new OnCompleteListener<GetTokenResult>() {
          @Override
          public void onComplete(@NonNull Task<GetTokenResult> task) {
            if (task.isSuccessful()) {
              Log.d(TAG, "getToken:onComplete:success");
              promise.resolve(task.getResult().getToken());
            } else {
              Exception exception = task.getException();
              WritableMap error = authExceptionToMap(exception);
              Log.e(TAG, "getToken:onComplete:failure", exception);
              promise.reject(error.getString("code"), error.getString("message"), exception);
            }
          }
        });
    } else {
      promiseNoUser(promise, true);
    }
  }


  // ----------------------- CLEAN ME -----------------------------------------------------
  // ----------------------- CLEAN ME -----------------------------------------------------
  // ----------------------- CLEAN ME -----------------------------------------------------
  // ----------------------- CLEAN ME -----------------------------------------------------
  // ----------------------- CLEAN ME -----------------------------------------------------
  // ----------------------- CLEAN ME -----------------------------------------------------
  // ----------------------- CLEAN ME -----------------------------------------------------
  // ----------------------- CLEAN ME -----------------------------------------------------
  // ----------------------- CLEAN ME -----------------------------------------------------

  @ReactMethod
  public void reauthenticate(final String provider, final String authToken, final String authSecret, final Callback callback) {
    // TODO:
    Utils.todoNote(TAG, "reauthenticateWithCredentialForProvider", callback);
    // AuthCredential credential;
    // Log.d(TAG, "reauthenticateWithCredentialForProvider called with: " + provider);
  }

  @ReactMethod
  public void updateUserEmail(final String email, final Callback callback) {
    FirebaseUser user = mAuth.getCurrentUser();

    if (user != null) {
      user
        .updateEmail(email)
        .addOnCompleteListener(new OnCompleteListener<Void>() {
          @Override
          public void onComplete(@NonNull Task<Void> task) {
            try {
              if (task.isSuccessful()) {
                Log.d(TAG, "User email address updated");
                userCallback(mAuth.getCurrentUser(), callback);
              } else {
                userErrorCallback(task, callback);
              }
            } catch (Exception ex) {
              userExceptionCallback(ex, callback);
            }
          }
        });
    } else {
      callbackNoUser(callback, true);
    }
  }

  @ReactMethod
  public void updateUserPassword(final String newPassword, final Callback callback) {
    FirebaseUser user = mAuth.getCurrentUser();

    if (user != null) {
      user.updatePassword(newPassword)
        .addOnCompleteListener(new OnCompleteListener<Void>() {
          @Override
          public void onComplete(@NonNull Task<Void> task) {
            try {
              if (task.isSuccessful()) {
                Log.d(TAG, "User password updated");
                userCallback(mAuth.getCurrentUser(), callback);
              } else {
                userErrorCallback(task, callback);
              }
            } catch (Exception ex) {
              userExceptionCallback(ex, callback);
            }
          }
        });
    } else {
      callbackNoUser(callback, true);
    }
  }

  @ReactMethod
  public void sendEmailVerification(final Callback callback) {
    FirebaseUser user = mAuth.getCurrentUser();

    if (user != null) {
      user.sendEmailVerification()
        .addOnCompleteListener(new OnCompleteListener<Void>() {
          @Override
          public void onComplete(@NonNull Task<Void> task) {
            try {
              if (task.isSuccessful()) {
                WritableMap resp = Arguments.createMap();
                resp.putString("status", "complete");
                resp.putString("msg", "User verification email sent");
                callback.invoke(null, resp);
              } else {
                WritableMap err = Arguments.createMap();
                err.putInt("errorCode", ERROR_SENDING_VERIFICATION_EMAIL);
                err.putString("errorMessage", task.getException().getMessage());
                callback.invoke(err);
              }
            } catch (Exception ex) {
              userExceptionCallback(ex, callback);
            }
          }
        });
    } else {
      callbackNoUser(callback, true);
    }
  }

  @ReactMethod
  public void updateUserProfile(ReadableMap props, final Callback callback) {
    FirebaseUser user = mAuth.getCurrentUser();

    if (user != null) {
      UserProfileChangeRequest.Builder profileBuilder = new UserProfileChangeRequest.Builder();

      Map<String, Object> m = Utils.recursivelyDeconstructReadableMap(props);

      if (m.containsKey("displayName")) {
        String displayName = (String) m.get("displayName");
        profileBuilder.setDisplayName(displayName);
      }

      if (m.containsKey("photoUri")) {
        String photoUriStr = (String) m.get("photoUri");
        Uri uri = Uri.parse(photoUriStr);
        profileBuilder.setPhotoUri(uri);
      }

      UserProfileChangeRequest profileUpdates = profileBuilder.build();

      user.updateProfile(profileUpdates)
        .addOnCompleteListener(new OnCompleteListener<Void>() {
          @Override
          public void onComplete(@NonNull Task<Void> task) {
            try {
              if (task.isSuccessful()) {
                Log.d(TAG, "User profile updated");
                userCallback(mAuth.getCurrentUser(), callback);
              } else {
                userErrorCallback(task, callback);
              }
            } catch (Exception ex) {
              userExceptionCallback(ex, callback);
            }
          }
        });
    } else {
      callbackNoUser(callback, true);
    }
  }


  // TODO: Check these things
  @ReactMethod
  public void googleLogin(String IdToken, final Callback callback) {
    AuthCredential credential = GoogleAuthProvider.getCredential(IdToken, null);
    mAuth.signInWithCredential(credential)
      .addOnCompleteListener(new OnCompleteListener<AuthResult>() {
        @Override
        public void onComplete(@NonNull Task<AuthResult> task) {
          try {
            if (task.isSuccessful()) {
              userCallback(task.getResult().getUser(), callback);
            } else {
              userErrorCallback(task, callback);
            }
          } catch (Exception ex) {
            userExceptionCallback(ex, callback);
          }
        }
      });
  }

  @ReactMethod
  public void facebookLogin(String Token, final Callback callback) {
    AuthCredential credential = FacebookAuthProvider.getCredential(Token);
    mAuth.signInWithCredential(credential)
      .addOnCompleteListener(new OnCompleteListener<AuthResult>() {
        @Override
        public void onComplete(@NonNull Task<AuthResult> task) {
          try {
            if (task.isSuccessful()) {
              userCallback(task.getResult().getUser(), callback);
            } else {
              userErrorCallback(task, callback);
            }
          } catch (Exception ex) {
            userExceptionCallback(ex, callback);
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
      promise.reject("auth/no_current_user", "No user currently signed in.");
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
   * firebaseUserToMap
   *
   * @param user
   * @return
   */
  private WritableMap firebaseUserToMap(FirebaseUser user) {
    WritableMap userMap = Arguments.createMap();

    final String email = user.getEmail();
    final String uid = user.getUid();
    final String provider = user.getProviderId();
    final String name = user.getDisplayName();
    final Boolean verified = user.isEmailVerified();
    final Uri photoUrl = user.getPhotoUrl();


    userMap.putString("uid", uid);
    userMap.putString("providerId", provider);
    userMap.putBoolean("emailVerified", verified);
    userMap.putBoolean("isAnonymous", user.isAnonymous());

    if (email != null) {
      userMap.putString("email", email);
    } else {
      userMap.putNull("email");
    }

    if (name != null) {
      userMap.putString("displayName", name);
    } else {
      userMap.putNull("displayName");
    }

    if (photoUrl != null) {
      userMap.putString("photoURL", photoUrl.toString());
    } else {
      userMap.putNull("photoURL");
    }

    return userMap;
  }

  /**
   * Returns web code and message values.
   *
   * @param exception Auth exception
   * @return WritableMap writable map with code and message string values
   */
  private WritableMap authExceptionToMap(Exception exception) {
    WritableMap error = Arguments.createMap();
    String code = "UNKNOWN";
    String message = exception.getMessage();

    try {
      FirebaseAuthException authException = (FirebaseAuthException) exception;
      code = authException.getErrorCode();
      message = authException.getMessage();
    } catch (Exception e) {
      Matcher matcher = Pattern.compile("\\[(.*?)\\]").matcher(message);
      if (matcher.find()) {
        code = matcher.group().substring(2, matcher.group().length() - 2).trim();
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
            message = "The email address is badly formatted.";
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

    error.putString("code", "auth/" + code.toLowerCase().replace("error_", "").replace('_', '-'));
    error.putString("message", message);
    return error;
  }


  // ------------------ Clean me when no longer used ------------------------------
  // ------------------ Clean me when no longer used ------------------------------
  // ------------------ Clean me when no longer used ------------------------------
  // ------------------ Clean me when no longer used ------------------------------
  // ------------------ Clean me when no longer used ------------------------------
  // ------------------ Clean me when no longer used ------------------------------

  @Deprecated
  private void userCallback(final FirebaseUser user, final Callback callback) {
    if (user != null) {
      user.getToken(true).addOnCompleteListener(new OnCompleteListener<GetTokenResult>() {
        @Override
        public void onComplete(@NonNull Task<GetTokenResult> task) {
          try {
            if (task.isSuccessful()) {
              WritableMap userMap = firebaseUserToMap(user);
              userMap.putString("token", task.getResult().getToken());
              callback.invoke(null, userMap);
            } else {
              userErrorCallback(task, callback);
            }
          } catch (Exception ex) {
            userExceptionCallback(ex, callback);
          }
        }
      });
    } else {
      callbackNoUser(callback, true);
    }
  }

  @Deprecated
  private void callbackNoUser(Callback callback, Boolean isError) {
    WritableMap err = Arguments.createMap();
    err.putInt("code", NO_CURRENT_USER);
    err.putString("message", "No current user");

    if (isError) {
      callback.invoke(err);
    } else {
      callback.invoke(null, null);
    }
  }

  @Deprecated
  private void userErrorCallback(Task task, final Callback onFail) {
    WritableMap error = Arguments.createMap();
    error.putString("message", ((FirebaseAuthException) task.getException()).getMessage());
    onFail.invoke(error);
  }

  @Deprecated
  private void userExceptionCallback(Exception ex, final Callback onFail) {
    WritableMap error = Arguments.createMap();
    error.putInt("code", ex.hashCode());
    error.putString("message", ex.getMessage());
    onFail.invoke(error);
  }
}
