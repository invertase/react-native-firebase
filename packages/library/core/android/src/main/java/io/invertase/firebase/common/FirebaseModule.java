package io.invertase.firebase.common;

import android.app.Activity;
import android.content.Context;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nullable;

public abstract class FirebaseModule {
  private final ContextProvider contextProvider;

  public FirebaseModule(ContextProvider context) {
    this.contextProvider = context;
  }

  public abstract String getName();

  public Map<String, Object> getConstants() {
    return new HashMap<>();
  }

  protected final Context getContext() {
    return contextProvider.getContext();
  }

  protected final Context getApplicationContext() {
    return contextProvider.getApplicationContext();
  }

  protected @Nullable
  final Activity getCurrentActivity() {
    return contextProvider.getActivity();
  }
}

