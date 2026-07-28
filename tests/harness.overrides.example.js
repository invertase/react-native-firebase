/*
 * Local e2e harness overrides (copy to harness.overrides.js — gitignored).
 *
 * Copy this file:
 *   cp tests/harness.overrides.example.js tests/harness.overrides.js
 *
 * Then edit harness.overrides.js for your local run. Never commit harness.overrides.js.
 *
 * Shape:
 *   {
 *     RNFBDebug?: boolean,   // true = verbose RNFB native/event logging; disables test retries
 *     modules?: string[],    // filter platformSupportedModules to this list (both Platform blocks)
 *   }
 *
 * Example — app package only, debug on:
 *   module.exports = {
 *     RNFBDebug: true,
 *     modules: ['app'],
 *   };
 *
 * Omit a field (or export {}) to keep committed defaults for that field.
 */

module.exports = {};
