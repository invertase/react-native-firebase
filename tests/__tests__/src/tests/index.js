import TestSuite from '../lib/TestSuite';

import asynchronousTestTests from './asynchronousTestTests';
import focusedTestTests from './focusedTestTests';
import pendingTestTests from './pendingTestTests';
import failingTestTests from './failingTestTests';
import timingOutTests from './timingOutTests';

const suite = new TestSuite('Internal', 'Test Definitions', {});

suite.addTests(asynchronousTestTests);
suite.addTests(focusedTestTests);
suite.addTests(pendingTestTests);
suite.addTests(failingTestTests);
suite.addTests(timingOutTests);

export default suite;
