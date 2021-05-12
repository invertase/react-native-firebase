package com.invertase.testing;

import java.io.File;
import java.lang.reflect.Method;

import androidx.test.platform.app.InstrumentationRegistry;
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
    dumpCoverageData();
  }

  // If you send '-e coverage' as part of the instrumentation command line, it should dump coverage as the Instrumentation finishes.
  // However, there is a long-standing UIAutomator bug that crashes the process during Instrumentation.finish, before dumping coverage.
  // It is trivial to dump it ourselves though, using the same mechanism the AndroidJUnit4Runner woud use
  // Code reference: https://android.googlesource.com/platform/frameworks/testing/+/refs/heads/master/support/src/android/support/test/internal/runner/listener/CoverageListener.java#68
  // UIAutomator issue: https://github.com/android/testing-samples/issues/89
  private void dumpCoverageData() {
    String coverageFilePath = InstrumentationRegistry.getInstrumentation().getTargetContext().getFilesDir().getAbsolutePath() +
                    File.separator + "coverage.ec";
    File coverageFile = new File(coverageFilePath);
    try {
        Class<?> emmaRTClass = Class.forName("com.vladium.emma.rt.RT");
        Method dumpCoverageMethod = emmaRTClass.getMethod("dumpCoverageData",
                coverageFile.getClass(), boolean.class, boolean.class);
        dumpCoverageMethod.invoke(null, coverageFile, false, false);
        System.out.println("Dumped code coverage data to " + coverageFilePath);
    } catch (Exception e) {
      System.err.println("Unable to dump coverage report: " + e);
    }
  }
}
