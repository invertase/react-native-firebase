package com.invertase.testing;

import android.app.Application;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.devsupport.DevInternalSettings;
import com.facebook.soloader.SoLoader;
import io.invertase.firebase.app.ReactNativeFirebaseApp;
import io.invertase.jet.JetPackage;

import java.util.List;


public class MainApplication extends Application implements ReactApplication {
  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      List<ReactPackage> packages = new PackageList(this).getPackages();
      return packages;
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    ReactNativeFirebaseApp.initializeSecondaryApp("secondaryFromNative", getApplicationContext());
    SoLoader.init(this, /* native exopackage */ false);

//    // TODO move to jet
//    DevInternalSettings settings = (DevInternalSettings) getReactNativeHost()
//      .getReactInstanceManager()
//      .getDevSupportManager()
//      .getDevSettings();
//
//    if (settings != null) {
//      settings.setBundleDeltasEnabled(false);
//    }
  }
}
