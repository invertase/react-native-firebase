import TestSuite from '../lib/TestSuite';

import hooksCallOrderTest from './hooksCallOrderTests';
import asynchronousHooksTests from './asynchronousHooksTests';
import hookScopeTests from './hookScopeTests';
import failingHookTests from './failingHookTests';
import timingOutHookTests from './timingOutHookTests';

const suite = new TestSuite('Internal', 'Lifecycle methods', {});

suite.addTests(hooksCallOrderTest);
suite.addTests(asynchronousHooksTests);
suite.addTests(hookScopeTests);
suite.addTests(failingHookTests);
suite.addTests(timingOutHookTests);

export default suite;
