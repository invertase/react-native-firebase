package io.invertase.firebase.common;

import android.app.Activity;
import android.content.Context;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

import java.util.Map;


public class ReactNativeFirebaseModule extends ReactContextBaseJavaModule implements ContextProvider {
  private FirebaseModule module;

  public ReactNativeFirebaseModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  protected void setModule(FirebaseModule module) {
    this.module = module;
  }

  public Context getContext() {
    return getReactApplicationContext();
  }

  public Context getApplicationContext() {
    return getReactApplicationContext().getApplicationContext();
  }

  public Activity getActivity() {
    return getCurrentActivity();
  }

  @Override
  public String getName() {
    return module.getName();
  }

  @Override
  public Map<String, Object> getConstants() {
    return module.getConstants();
  }
}
