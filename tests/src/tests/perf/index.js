import firebase from '../../firebase';
import TestSuite from '../../../lib/TestSuite';

import performanceTests from './performanceTests';

const suite = new TestSuite('Performance Monitoring', 'firebase.perf()', firebase);

suite.addTests(performanceTests);

export default suite;
