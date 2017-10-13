import firebase from '../../firebase';
import TestSuite from '../../../lib/TestSuite';
import linksTests from './linksTests';

const suite = new TestSuite('Links', 'firebase.links()', firebase);

suite.addTests(linksTests);

export default suite;
