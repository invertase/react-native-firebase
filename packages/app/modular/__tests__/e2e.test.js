import { initializeApp, getApp } from '../src';

async function create(name) {
  return initializeApp(
    {
      apiKey: 'AIzaSyAgUhHU8wSJgO5MVNy95tMT07NEjzMOfz0',
      authDomain: 'react-native-firebase-testing.firebaseapp.com',
      databaseURL: 'https://react-native-firebase-testing.firebaseio.com',
      projectId: 'react-native-firebase-testing',
      storageBucket: 'react-native-firebase-testing.appspot.com',
      messagingSenderId: '448618578101',
      appId: '1:448618578101:web:0b650370bb29e29cac3efc',
      measurementId: 'G-F79DJ0VFGS',
    },
    name,
  );
}

describe('app', () => {
  describe('getApp', () => {
    test('it gets an app', async () => {
      const created = await create('getAppFoo');

      const app = getApp('getAppFoo');
      expect(app.name).toBe(created.name);
    });
  });

  describe('getApp2', () => {
    test('it gets an app', async () => {
      const created = await create('foo');
      const app = getApp('foo');
      expect(app.name).toBe(created.name);
    });
  });
});
