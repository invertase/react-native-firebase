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
#else
    FirebaseApp.configure()
#endif
    return true
  }
}
