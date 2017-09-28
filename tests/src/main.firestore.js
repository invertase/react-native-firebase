import React, { Component } from 'react';
import { Text, View } from 'react-native';
import fb from './firebase';

global.Promise = require('bluebird');

const firebase = fb.native;


function bootstrap() {
  // Remove logging on production
  if (!__DEV__) {
    console.log = () => {
    };
    console.warn = () => {
    };
    console.error = () => {
    };
    console.disableYellowBox = true;
  }

  class Root extends Component {

    async componentDidMount() {
      console.log(`Starting`);
      const db = firebase.firestore();
      const docRef = await db.collection('chris').add({ first: 'Ada', last: 'Lovelace', born: 1815 });
      console.log(`Document written with ID: ${docRef.id}`);
      const docRef2 = await db.collection('chris').add({ first: 'Alan', middle: 'Mathison', last: 'Turing', born: 1912 });
      console.log(`Document written with ID: ${docRef2.id}`);
      await db.collection('chris').doc('manual').set({ first: 'Manual', last: 'Man', born: 1234 });
      console.log('Manual document set');
      await db.collection('chris').doc().set({ first: 'Auto', last: 'Man', born: 2000 });
      console.log('Auto document set');

      const docRefT = db.doc(docRef.path);
      const docRefS = await docRefT.get();
      console.log(`Should be the same as first written ID: ${docRefT.id}`, docRefS.data());

      await docRefT.set({ empty: true });
      const docRefS2 = await docRefT.get();
      console.log(`Should have empty only: ${docRefT.id}`, docRefS2.data());

      await docRefT.set({ first: 'Ada', last: 'Lovelace', born: 1815 }, { merge: true });
      const docRefS3 = await docRefT.get();
      console.log(`Should have everything plus empty: ${docRefT.id}`, docRefS3.data());

      await docRefT.update({ first: 'AdaUpdated' });
      const docRefS4 = await docRefT.get();
      console.log(`Should have updated firstname: ${docRefT.id}`, docRefS4.data());

      const docs = await db.collection('chris').get();
      const tasks = [];
      docs.forEach((doc) => {
        console.log(`Cleaning up ${doc.id}`, doc.data());
        tasks.push(doc.ref.delete());
      });
      Promise.all(tasks);
      console.log('Finished cleaning collection');

      const nycRef = db.collection('chris').doc('NYC');
      const sfRef = db.collection('chris').doc('SF');

      await db.batch()
        .set(nycRef, { name: 'New York City' })
        .set(sfRef, { name: 'San Francisco' })
        .commit();

      const docs2 = await db.collection('chris').get();
      docs2.forEach((doc) => {
        console.log(`Got ${doc.id}`, doc.data());
      });

      await db.batch()
        .update(nycRef, { population: 1000000 })
        .update(sfRef, { name: 'San Fran' })
        .commit();
      const docs3 = await db.collection('chris').get();
      docs3.forEach((doc) => {
        console.log(`Got ${doc.id}`, doc.data());
      });

      await db.batch()
        .delete(nycRef)
        .delete(sfRef)
        .commit();
      const docs4 = await db.collection('chris').get();
      docs4.forEach((doc) => {
        console.log(`Got ${doc.id}`, doc.data());
      });
      console.log('Finished');
    }

    render() {
      return (
        <View>
            <Text>Check console logs</Text>
        </View>
      );
    }
  }

  return Root;
}

export default bootstrap();
