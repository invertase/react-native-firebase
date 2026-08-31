/**
 * Metro-safe coverage runtime knobs for the dedicated test app.
 * Keep `nativeModuleName` / `enabled` aligned with
 * `tests/react-native-coverage.config.js` (Node SoT for host scripts).
 * Do not import Node builtins here — this file is bundled into the app.
 *
 * Flush via portal-linked `react-native-coverage` TurboModule (`Coverage`).
 */
module.exports = {
  enabled: true,
  nativeModuleName: 'Coverage',
};
