package io.invertase.firebase.common;

import android.app.Activity;
import android.content.Context;
//
//import expo.core.ExportedModule;
//import expo.core.ModuleRegistry;
//import expo.core.Promise;
//import expo.core.interfaces.ActivityProvider;
//import expo.core.interfaces.ExpoMethod;
//import expo.core.interfaces.ModuleRegistryConsumer;
//
//import java.util.Map;
//
//public class ExpoFirebaseModule extends ExportedModule implements ModuleRegistryConsumer, ContextProvider {
//  private Context mContext;
//  private FirebaseModule module;
//  private ModuleRegistry mModuleRegistry;
//
//  public ExpoFirebaseModule(Context context) {
//    super(context);
//    this.mContext = context;
//  }
//
//  protected void setModule(FirebaseModule module) {
//    this.module = module;
//  }
//
//  public Context getContext() {
//    return getReactApplicationContext();
//  }
//
//  public Context getApplicationContext() {
//    return getReactApplicationContext().getApplicationContext();
//  }
//
//  public Activity getActivity() {
//    return getCurrentActivity();
//  }
//
//  @Override
//  public String getName() {
//    return module.getName();
//  }
//
//  @Override
//  public Map<String, Object> getConstants() {
//    return module.getConstants();
//  }
//}
