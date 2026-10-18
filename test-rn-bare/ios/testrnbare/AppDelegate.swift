import UIKit
#if RNFB_DYNAMIC_FIREBASE_PROBE
import RNFBFirebase
#else
import Firebase
#endif

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  /// Kept for tooling that expects AppDelegate.window; SceneDelegate creates and assigns it.
  var window: UIWindow?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
#if RNFB_DYNAMIC_FIREBASE_PROBE
    RNFBFirebaseAppClient.configure()
    // Probe-owned breadcrumb at default log level (no -FIRDebugEnabled required).
    // Launch smoke hard-asserts this; FirebaseCore I-COR000001 is soft-only.
    NSLog("RNFB_PROBE_CONFIGURE_OK")
#else
    FirebaseApp.configure()
#endif
    return true
  }
}
