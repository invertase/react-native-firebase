/*
 * Committed empty stub for the optional, gitignored tests/harness.overrides.js.
 *
 * tests/metro.config.js resolves `./harness.overrides.js` to this file whenever
 * the local override does not exist. Without a real resolution target, Metro
 * treats the optional (try/catch) require as an unresolved dependency and OMITS
 * it from the module's dependency-id array, shifting every later dependency and
 * dropping the last one — surfacing at runtime as
 * `Requiring unknown module "undefined"`. Keeping this stub guarantees the
 * dependency always resolves, so the dependency map stays intact.
 *
 * Do not add overrides here. Copy tests/harness.overrides.example.js to
 * tests/harness.overrides.js for local customization instead.
 */
module.exports = {};
