package io.invertase.firebase.common;

import android.app.Activity;
import android.content.Context;

public interface ContextProvider {
  Activity getActivity();
  Context getContext();
  Context getApplicationContext();
}
