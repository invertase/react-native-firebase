import firebase from '../../firebase';
import TestSuite from '../../../lib/TestSuite';
import configTests from './configTests';

const suite = new TestSuite('Remote Config', 'firebase.config()', firebase);

// bootstrap tests
suite.addTests(configTests);

export default suite;
