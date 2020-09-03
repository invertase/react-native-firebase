package io.invertase.firebase.messaging;

public class ReactNativeFirebaseMessagingStoreHelper {

  private ReactNativeFirebaseMessagingStore messagingStore;

  private ReactNativeFirebaseMessagingStoreHelper() {
    messagingStore = new ReactNativeFirebaseMessagingStoreImpl();
  }

  private static ReactNativeFirebaseMessagingStoreHelper _instance;

  public static ReactNativeFirebaseMessagingStoreHelper getInstance() {
    if (_instance == null) {
      _instance = new ReactNativeFirebaseMessagingStoreHelper();
    }
    return _instance;
  }

  public ReactNativeFirebaseMessagingStore getMessagingStore() {
    return messagingStore;
  }
}
