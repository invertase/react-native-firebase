package io.invertase.firebase.messaging;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import me.leolin.shortcutbadger.ShortcutBadger;

public class BadgeHelper {

  private static final String TAG = "BadgeHelper";
  private static final String PREFERENCES_FILE = "BadgeCountFile";
  private static final String BADGE_COUNT_KEY = "BadgeCount";

  private Context mContext;
  private SharedPreferences sharedPreferences = null;

  public BadgeHelper(Context context) {
    mContext = context;
    sharedPreferences = (SharedPreferences) mContext.getSharedPreferences(PREFERENCES_FILE, Context.MODE_PRIVATE);
  }

  public int getBadgeCount() {
    return sharedPreferences.getInt(BADGE_COUNT_KEY, 0);
  }

  public void setBadgeCount(int badgeCount) {
    storeBadgeCount(badgeCount);
    if (badgeCount == 0) {
      ShortcutBadger.removeCount(mContext);
      Log.d(TAG, "Remove count");
    } else {
      ShortcutBadger.applyCount(mContext, badgeCount);
      Log.d(TAG, "Apply count: " + badgeCount);
    }
  }

  private void storeBadgeCount(int badgeCount) {
    SharedPreferences.Editor editor = sharedPreferences.edit();
    editor.putInt(BADGE_COUNT_KEY, badgeCount);
    editor.apply();
  }
}
