## Expo Config Plugin unit tests

To test the changes to native code applied by config plugins, [snapshot tests](https://jestjs.io/docs/snapshot-testing) are used. Plugin test flow, in short:

1. A test fixture is loaded. In this case, fixtures are template files (`build.gradle`, `AppDelegate.m` etc.) from [`expo-template-bare-minimum`](https://github.com/expo/expo/tree/master/templates/expo-template-bare-minimum).
2. Plugin changes are applied (e.g. gradle dependency is added).
3. Modified file is compared with previously saved snapshot. If they're equal, the test passes. If not, the test fails and the difference (actual vs expected) is shown.

You can preview the snapshot files manually, by opening `__snapshots__/*.snap` files.

### Updating the snapshots

Snapshot tests are designed to ensure the plugin result will not change. In case you intentionally modified the plugin behavior (e.g. updated gradle dependency versions), you have to update the snapshots, otherwise the tests will fail. There are two ways to do it:

- Update all snapshots by running `npm run tests:jest -u`.
- Update snapshots interactively, one by one:
  1. Run `yarn tests:jest --watchAll`
  2. Press `i` to let `jest` display changes and prompt you for updating each snapshot.
     > This option is not available, when there are no failing snapshots
