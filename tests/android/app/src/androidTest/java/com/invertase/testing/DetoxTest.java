package com.invertase.testing;

import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.filters.LargeTest;
import androidx.test.rule.ActivityTestRule;

import com.wix.detox.Detox;

import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
@LargeTest
public class DetoxTest {

  @Rule
  // Replace 'MainActivity' with the value of android:name entry in
  // <activity> in AndroidManifest.xml
  public ActivityTestRule<MainActivity> mActivityRule = new ActivityTestRule<>(
    MainActivity.class, false, false);

  @Test
  public void runDetoxTests() {
    Detox.runTests(mActivityRule);
  }
}
