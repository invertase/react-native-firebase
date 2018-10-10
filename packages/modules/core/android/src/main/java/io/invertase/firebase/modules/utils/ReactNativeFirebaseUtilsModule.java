package io.invertase.firebase.modules.utils;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;

import io.invertase.firebase.common.ReactNativeFirebaseModule;


@SuppressWarnings("WeakerAccess")
public class ReactNativeFirebaseUtilsModule extends ReactNativeFirebaseModule {
  private final FirebaseUtilsModule module;

  public ReactNativeFirebaseUtilsModule(ReactApplicationContext reactContext) {
    super(reactContext);
    module = new FirebaseUtilsModule(this);
    super.setModule(module);
  }

  @ReactMethod
  public void getPlayServicesStatus(Promise promise) {
    promise.resolve(Arguments.fromBundle(module.getPlayServicesStatus()));
  }

  @ReactMethod
  public void promptForPlayServices() {
    module.promptForPlayServices();
  }

  @ReactMethod
  public void resolutionForPlayServices() {
    module.resolutionForPlayServices();
  }

  @ReactMethod
  public void makePlayServicesAvailable() {
    module.makePlayServicesAvailable();
  }
}
