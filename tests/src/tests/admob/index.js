import firebase from '../../firebase';
import TestSuite from '../../../lib/TestSuite';
import admobTests from './admob';

const suite = new TestSuite('AdMob', 'firebase.admob()', firebase);

suite.addTests(admobTests);

export default suite;
