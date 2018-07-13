import firebase from '../../firebase';
import TestSuite from '../../../lib/TestSuite';

import iidTests from './iidTests';

const suite = new TestSuite('Iid', 'firebase.id()', firebase);

suite.addTests(iidTests);

export default suite;
