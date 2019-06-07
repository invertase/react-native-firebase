package com.invertase.testing;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;

import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {

  public static final int PERMISSION_REQ_CODE = 1234;
  public static final int OVERLAY_PERMISSION_REQ_CODE = 1235;

  String[] perms = {
    "android.permission.READ_EXTERNAL_STORAGE",
    "android.permission.WRITE_EXTERNAL_STORAGE"
  };

  /**
   * Returns the name of the main component registered from JavaScript.
   * This is used to schedule rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "testing";
  }

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    checkWindowPerms();
    // ATTENTION: This was auto-generated to handle app links.
    Intent appLinkIntent = getIntent();
    String appLinkAction = appLinkIntent.getAction();
    Uri appLinkData = appLinkIntent.getData();
  }

  public void checkWindowPerms() {
    // Checking if device version > 22 and we need to use new permission model
    if (Build.VERSION.SDK_INT > Build.VERSION_CODES.LOLLIPOP_MR1) {
      // Checking if we can draw window overlay
      if (!Settings.canDrawOverlays(this)) {
        // Requesting permission for window overlay(needed for all react-native apps)
        Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
          Uri.parse("package:" + getPackageName()));
        startActivityForResult(intent, OVERLAY_PERMISSION_REQ_CODE);
      }
      for (String perm : perms) {
        // Checking each permission and if denied then requesting permissions
        if (checkSelfPermission(perm) == PackageManager.PERMISSION_DENIED) {
          requestPermissions(perms, PERMISSION_REQ_CODE);
          break;
        }
      }
    }
  }

  // Window overlay permission intent result
  @Override
  public void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    if (requestCode == OVERLAY_PERMISSION_REQ_CODE) {
      checkWindowPerms();
    }
  }

  // Permission results
  @Override
  public void onRequestPermissionsResult(int permsRequestCode, String[] permissions, int[] grantResults) {
    switch (permsRequestCode) {
      case PERMISSION_REQ_CODE:
        // example how to get result of permissions requests (there can be more then one permission dialog)
        // boolean readAccepted = grantResults[0]==PackageManager.PERMISSION_GRANTED;
        // boolean writeAccepted = grantResults[1]==PackageManager.PERMISSION_GRANTED;
        // checking permissions to prevent situation when user denied some permission
        checkWindowPerms();
        break;

    }
  }
}
