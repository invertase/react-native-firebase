import firebase from 'react-native-firebase';
import '@react-native-firebase/analytics';

firebase.analytics().setUserProperties({ test: 'foo' });
