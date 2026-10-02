package expo.core;

/**
 * Test-source-only classpath marker that makes the default SharedUtils detector see Expo. Isolated
 * class loaders in SharedUtilsJavaCompatibilityTest explicitly hide it for non-Expo cases.
 */
public final class ModuleRegistry {
  private ModuleRegistry() {}
}
