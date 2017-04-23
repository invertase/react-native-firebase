import firebase from '../../firebase';
import TestSuite from '../../../lib/TestSuite';
import storageTests from './storageTests';

const suite = new TestSuite('Storage', 'Upload/Download storage tests', firebase);

suite.addTests(storageTests);

export default suite;

