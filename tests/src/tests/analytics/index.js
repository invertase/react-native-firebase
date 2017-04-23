import firebase from '../../firebase';
import TestSuite from '../../../lib/TestSuite';
import analyticsTests from './analytics';

const suite = new TestSuite('Analytics', 'firebase.analytics()', firebase);

suite.addTests(analyticsTests);

export default suite;
