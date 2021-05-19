package com.invertase.testing;

import java.io.File;
import java.lang.reflect.Method;

import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.filters.LargeTest;
import androidx.test.rule.ActivityTestRule;

import com.google.firebase.appcheck.debug.testing.DebugAppCheckTestHelper;

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

    try {
      // 1) Detox makes it extremely difficult to pass unencoded arguments directly to the instrumentation runner on Android:
      // https://github.com/wix/Detox/issues/2933
      // 
      // 2) AppCheck will only let you set a debug AppCheck token in CI via their test helpers via instrumentation runner args
      // https://firebase.google.com/docs/app-check/android/debug-provider#ci
      // 
      // Here we avoid the Detox argument-passing / AppCheck argument-reading difficulty by directly putting the String in.
      // 
      // This is unwanted in nearly all scenarios as it leaks an AppCheck token, but the react-native-firebase test
      // project does not have AppCheck set to enforcing, so this is okay for this project.
      //
      // This has a great potential for leaking your token in a real app that wants to enforce and rely on AppCheck.
      Class<?> testHelperClass = DebugAppCheckTestHelper.class;
      Method[] methods = testHelperClass.getDeclaredMethods();
      for (int i = 0; i < methods.length; i++) {
        if (methods[i].getName().equals("fromString")) {
          Method testHelperMethod = methods[i];
          testHelperMethod.setAccessible(true);
          DebugAppCheckTestHelper debugAppCheckTestHelper = 
            (DebugAppCheckTestHelper)testHelperMethod.invoke(null, "698956B2-187B-49C6-9E25-C3F3530EEBAF");
          debugAppCheckTestHelper.withDebugProvider(() -> {

            // This is the standard Detox androidTest implementation:
            Detox.runTests(mActivityRule);

            dumpCoverageData();
          });
        }
      }
    } catch (Exception e) {
      throw new RuntimeException("Unable to force AppCheck debug token: ", e);
    }
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
