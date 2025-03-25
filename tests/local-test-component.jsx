/* eslint-disable react/react-in-jsx-scope */

// Add new components in `local-tests` sub-directory,
// with a corresponding import/export in the `local-tests/index.js` file
//
// that file itself is copied during `yarn lerna:prepare` from
// `local-tests/index.example.js` if it does not exist, then
// you are free to modify it
//
// Why do we maintain a list and copy a template?
//
// 1) react-native has no way to do dynamic requires or imports, they require
// constant strings, so we can't just read directory contents and dynamically
// iterate on them unfortunately. So we have to maintain a list of local-only things.
//
// 2) But if you maintain a local-only change, you risk of accidentally committing
// the local-only changes. To keep local changes without commit risk we have to
// do a template copy from an example.

import { TestComponents } from './local-tests';

export function LocalTests() {
  return <TestComponents />;
}
