import firebase from '../../firebase';
import TestSuite from '../../../lib/TestSuite';

import messagingTests from './messagingTests';

const suite = new TestSuite('Messaging', 'firebase.messaging()', firebase);

suite.addTests(messagingTests);

export default suite;
