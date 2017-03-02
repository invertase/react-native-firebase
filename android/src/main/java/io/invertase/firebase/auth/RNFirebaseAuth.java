
package io.invertase.firebase.auth;

import android.util.Log;

import java.util.Map;

import android.net.Uri;
import android.support.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReactContext;

import com.google.android.gms.tasks.OnCompleteListener;
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

  // private Context context;
  private ReactContext mReactContext;
  private FirebaseAuth mAuth;
  private FirebaseAuth.AuthStateListener mAuthListener;

  public RNFirebaseAuth(ReactApplicationContext reactContext) {
    super(reactContext);
    mReactContext = reactContext;
    mAuth = FirebaseAuth.getInstance();

    Log.d(TAG, "New RNFirebaseAuth instance");
  }

  @Override
  public String getName() {
    return TAG;
  }

  /**
   * Returns a no user error.
   *
   * @param callback JS callback
   */
  private void callbackNoUser(Callback callback, Boolean isError) {
    WritableMap err = Arguments.createMap();
    err.putInt("errorCode", NO_CURRENT_USER);
    err.putString("errorMessage", "No current user");

    if (isError) {
      callback.invoke(err);
    } else {
      callback.invoke(null, null);
    }
  }

  @ReactMethod
  public void listenForAuth() {
    if (mAuthListener == null) {
      mAuthListener = new FirebaseAuth.AuthStateListener() {
        @Override
        public void onAuthStateChanged(@NonNull FirebaseAuth firebaseAuth) {
          FirebaseUser user = firebaseAuth.getCurrentUser();
          WritableMap msgMap = Arguments.createMap();
          msgMap.putString("eventName", "listenForAuth");

          if (user != null) {
            // TODO move to helper
            WritableMap userMap = getUserMap(user);
            msgMap.putBoolean("authenticated", true);
            msgMap.putMap("user", userMap);

            Utils.sendEvent(mReactContext, "listenForAuth", msgMap);
          } else {
            msgMap.putBoolean("authenticated", false);
            Utils.sendEvent(mReactContext, "listenForAuth", msgMap);
          }
        }
      };
      mAuth.addAuthStateListener(mAuthListener);
    }
  }

  @ReactMethod
  public void unlistenForAuth(final Callback callback) {
    if (mAuthListener != null) {
      mAuth.removeAuthStateListener(mAuthListener);

      // TODO move to helper
      WritableMap resp = Arguments.createMap();
      resp.putString("status", "complete");

      callback.invoke(null, resp);
    }
  }

  @ReactMethod
  public void createUserWithEmail(final String email, final String password, final Callback callback) {
    mAuth.createUserWithEmailAndPassword(email, password)
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
  public void signInWithEmail(final String email, final String password, final Callback callback) {

    mAuth.signInWithEmailAndPassword(email, password)
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
  public void signInWithProvider(final String provider, final String authToken, final String authSecret, final Callback callback) {
    if (provider.equals("facebook")) {
      this.facebookLogin(authToken, callback);
    } else if (provider.equals("google")) {
      this.googleLogin(authToken, callback);
    } else
      // TODO
      Utils.todoNote(TAG, "signInWithProvider", callback);
  }

  @ReactMethod
  public void linkPassword(final String email, final String password, final Callback callback) {
    FirebaseUser user = mAuth.getCurrentUser();

    if (user != null) {
      AuthCredential credential = EmailAuthProvider.getCredential(email, password);
      user
          .linkWithCredential(credential)
          .addOnCompleteListener(new OnCompleteListener<AuthResult>() {
            @Override
            public void onComplete(@NonNull Task<AuthResult> task) {
              try {
                if (task.isSuccessful()) {
                  Log.d(TAG, "user linked with password credential");
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
  public void link(final String provider, final String authToken, final String authSecret, final Callback callback) {
    if (provider.equals("password")) {
      linkPassword(authToken, authSecret, callback);
    } else
      // TODO other providers
      Utils.todoNote(TAG, "linkWithProvider", callback);
  }

  @ReactMethod
  public void signInAnonymously(final Callback callback) {
    Log.d(TAG, "signInAnonymously:called:");
    mAuth.signInAnonymously()
        .addOnCompleteListener(new OnCompleteListener<AuthResult>() {
          @Override
          public void onComplete(@NonNull Task<AuthResult> task) {
            Log.d(TAG, "signInAnonymously:onComplete:" + task.isSuccessful());

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
  public void signInWithCustomToken(final String customToken, final Callback callback) {
    mAuth.signInWithCustomToken(customToken)
        .addOnCompleteListener(new OnCompleteListener<AuthResult>() {
          @Override
          public void onComplete(@NonNull Task<AuthResult> task) {
            Log.d(TAG, "signInWithCustomToken:onComplete:" + task.isSuccessful());
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
  public void reauthenticateWithCredentialForProvider(final String provider, final String authToken, final String authSecret, final Callback callback) {
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
  public void sendPasswordResetWithEmail(final String email, final Callback callback) {
    mAuth.sendPasswordResetEmail(email)
        .addOnCompleteListener(new OnCompleteListener<Void>() {
          @Override
          public void onComplete(@NonNull Task<Void> task) {
            try {
              if (task.isSuccessful()) {
                WritableMap resp = Arguments.createMap();
                resp.putString("status", "complete");
                callback.invoke(null, resp);
              } else {
                callback.invoke(task.getException().toString());
              }
            } catch (Exception ex) {
              userExceptionCallback(ex, callback);
            }
          }
        });
  }

  @ReactMethod
  public void deleteUser(final Callback callback) {
    FirebaseUser user = mAuth.getCurrentUser();
    if (user != null) {
      user.delete()
          .addOnCompleteListener(new OnCompleteListener<Void>() {
            @Override
            public void onComplete(@NonNull Task<Void> task) {
              try {
                if (task.isSuccessful()) {
                  Log.d(TAG, "User account deleted");
                  WritableMap resp = Arguments.createMap();
                  resp.putString("status", "complete");
                  resp.putString("msg", "User account deleted");
                  callback.invoke(null, resp);
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
  public void getToken(final Callback callback) {
    FirebaseUser user = mAuth.getCurrentUser();

    if (user != null) {
      user.getToken(true)
          .addOnCompleteListener(new OnCompleteListener<GetTokenResult>() {
            @Override
            public void onComplete(@NonNull Task<GetTokenResult> task) {
              try {
                if (task.isSuccessful()) {
                  String token = task.getResult().getToken();
                  WritableMap resp = Arguments.createMap();
                  resp.putString("status", "complete");
                  resp.putString("token", token);
                  callback.invoke(null, resp);
                } else {
                  WritableMap err = Arguments.createMap();
                  err.putInt("errorCode", ERROR_FETCHING_TOKEN);
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

  @ReactMethod
  public void signOut(final Callback callback) {
    mAuth.signOut();

    WritableMap resp = Arguments.createMap();
    resp.putString("status", "complete");
    resp.putString("msg", "User signed out");
    callback.invoke(null, resp);
  }

  @ReactMethod
  public void reloadUser(final Callback callback) {
    FirebaseUser user = mAuth.getCurrentUser();

    if (user == null) {
      callbackNoUser(callback, false);
    } else {
      user.reload()
          .addOnCompleteListener(new OnCompleteListener<Void>() {
            @Override
            public void onComplete(@NonNull Task<Void> task) {
              if (task.isSuccessful()) {
                Log.d(TAG, "user reloaded");
                userCallback(mAuth.getCurrentUser(), callback);
              } else {
                userErrorCallback(task, callback);
              }
            }
          });
    }
  }

  @ReactMethod
  public void getCurrentUser(final Callback callback) {
    FirebaseUser user = mAuth.getCurrentUser();

    if (user == null) {
      callbackNoUser(callback, false);
    } else {
      Log.d("USRC", user.getUid());
      userCallback(user, callback);
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

  // Internal helpers
  private void userCallback(final FirebaseUser user, final Callback callback) {
    if (user != null) {
      user.getToken(true).addOnCompleteListener(new OnCompleteListener<GetTokenResult>() {
        @Override
        public void onComplete(@NonNull Task<GetTokenResult> task) {
          try {
            if (task.isSuccessful()) {
              WritableMap userMap = getUserMap(user);
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

  private void userErrorCallback(Task task, final Callback onFail) {
    WritableMap error = Arguments.createMap();
    error.putString("code", ((FirebaseAuthException) task.getException()).getErrorCode());
    error.putString("message", task.getException().getMessage());
    onFail.invoke(error);
  }

  private void userExceptionCallback(Exception ex, final Callback onFail) {
    WritableMap error = Arguments.createMap();
    error.putInt("code", ex.hashCode());
    error.putString("message", ex.getMessage());
    onFail.invoke(error);
  }

  private WritableMap getUserMap(FirebaseUser user) {
    WritableMap userMap = Arguments.createMap();
    if (user != null) {
      final String email = user.getEmail();
      final String uid = user.getUid();
      final String provider = user.getProviderId();
      final String name = user.getDisplayName();
      final Boolean verified = user.isEmailVerified();
      final Uri photoUrl = user.getPhotoUrl();

      userMap.putString("email", email);
      userMap.putString("uid", uid);
      userMap.putString("providerId", provider);
      userMap.putBoolean("emailVerified", verified);

      if (name != null) {
        userMap.putString("name", name);
      }

      if (photoUrl != null) {
        userMap.putString("photoURL", photoUrl.toString());
      }
    } else {
      userMap.putString("msg", "no user");
    }

    return userMap;
  }
}
