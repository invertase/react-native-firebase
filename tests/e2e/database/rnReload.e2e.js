const { CONTENTS, setDatabaseContents } = TestHelpers.database;

describe('database()', () => {
  before(() => setDatabaseContents());

  describe('ref().once()', () => {
    it('same reference path works after React Native reload', async () => {
      let ref;
      let snapshot;
      const path = 'tests/types/number';
      const dataTypeValue = CONTENTS.DEFAULT.number;

      // before reload
      ref = firebase.database().ref(path);
      snapshot = await ref.once('value');
      snapshot.val().should.eql(dataTypeValue);

      // RELOAD
      await device.reloadReactNative();

      // after reload
      ref = firebase.database().ref(path);
      snapshot = await ref.once('value');
      snapshot.val().should.eql(dataTypeValue);
    }).timeout(15000);

    it(':android: same reference path works after app backgrounded', async () => {
      let ref;
      let snapshot;
      const path = 'tests/types/number';
      const dataTypeValue = CONTENTS.DEFAULT.number;

      // before
      ref = firebase.database().ref(path);
      snapshot = await ref.once('value');
      snapshot.val().should.eql(dataTypeValue);

      await device.sendToHome();
      await sleep(250);
      await device.launchApp({ newInstance: false });
      await sleep(250);

      // after
      ref = firebase.database().ref(path);
      snapshot = await ref.once('value');
      snapshot.val().should.eql(dataTypeValue);
    }).timeout(15000);
  });

  describe('ref().on()', () => {
    it('same reference path works after React Native reload', async () => {
      let ref;
      let snapshot;
      const path = 'tests/types/number';
      const dataTypeValue = CONTENTS.DEFAULT.number;

      // before reload
      ref = firebase.database().ref(path);
      snapshot = await new Promise(resolve => ref.on('value', resolve));
      snapshot.val().should.eql(dataTypeValue);

      // RELOAD
      await device.reloadReactNative();

      // after reload
      ref = firebase.database().ref(path);
      snapshot = await new Promise(resolve => ref.on('value', resolve));
      snapshot.val().should.eql(dataTypeValue);

      firebase.utils().database.cleanup();
    }).timeout(15000);

    it(':android: same reference path works after app backgrounded', async () => {
      let ref;
      let snapshot;
      const path = 'tests/types/number';
      const dataTypeValue = CONTENTS.DEFAULT.number;

      // before background
      ref = firebase.database().ref(path);
      snapshot = await new Promise(resolve => ref.on('value', resolve));
      snapshot.val().should.eql(dataTypeValue);

      await device.sendToHome();
      await sleep(250);
      await device.launchApp({ newInstance: false });
      await sleep(250);

      // after background
      ref = firebase.database().ref(path);
      snapshot = await new Promise(resolve => ref.on('value', resolve));
      snapshot.val().should.eql(dataTypeValue);

      firebase.utils().database.cleanup();
    }).timeout(15000);
  });
});
