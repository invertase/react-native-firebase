import UIKit
import Firebase

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  /// Kept for tooling that expects AppDelegate.window; SceneDelegate creates and assigns it.
  var window: UIWindow?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    FirebaseApp.configure()
    return true
  }
}
