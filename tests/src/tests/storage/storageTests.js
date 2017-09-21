import RNfirebase from './../../../firebase/firebase';

function storageTests({ describe, it, firebase, tryCatch }) {
  describe('ref(:path)', () => {
    it('toString() should return the correct bucket path to the file', () => {
      const app = RNfirebase.app();
      firebase.native.storage().ref('/uploadNope.jpeg').toString()
        .should.equal(`gs://${app.options.storageBucket}/uploadNope.jpeg`);
    });
  });

  describe('downloadFile()', () => {
    it('it should error on download file if permission denied', () => {
      return new Promise((resolve, reject) => {
        const successCb = tryCatch(() => {
          reject(new Error('No permission denied error'));
        }, reject);

        const failureCb = tryCatch((error) => {
          error.code.should.equal('storage/unauthorized');
          error.message.includes('not authorized').should.be.true();
          resolve();
        }, reject);

        firebase.native.storage().ref('/not.jpg')
          .downloadFile(
            `${firebase.native.storage.Native.DOCUMENT_DIRECTORY_PATH}/not.jpg`,
          )
          .then(successCb)
          .catch(failureCb);
      });
    });

    it('it should download a file', () => {
      return new Promise((resolve, reject) => {
        const successCb = tryCatch((meta) => {
          meta.state.should.eql(firebase.native.storage.TaskState.SUCCESS);
          meta.bytesTransferred.should.eql(meta.totalBytes);
          resolve();
        }, reject);

        const failureCb = tryCatch((error) => {
          reject(error);
        }, reject);

        firebase.native.storage().ref('/ok.jpeg').downloadFile(`${firebase.native.storage.Native.DOCUMENT_DIRECTORY_PATH}/ok.jpeg`).then(successCb).catch(failureCb);
      });
    });
  });

  describe('putFile()', () => {
    it('it should error on upload if permission denied', () => {
      return new Promise((resolve, reject) => {
        const successCb = tryCatch(() => {
          reject(new Error('No permission denied error'));
        }, reject);

        const failureCb = tryCatch((error) => {
          error.code.should.equal('storage/unauthorized');
          error.message.includes('not authorized').should.be.true();
          resolve();
        }, reject);

        firebase.native.storage().ref('/uploadNope.jpeg').putFile(`${firebase.native.storage.Native.DOCUMENT_DIRECTORY_PATH}/ok.jpeg`).then(successCb).catch(failureCb);
      });
    });

    it('it should upload a file', () => {
      return new Promise((resolve, reject) => {
        const successCb = tryCatch((uploadTaskSnapshot) => {
          uploadTaskSnapshot.state.should.eql(firebase.native.storage.TaskState.SUCCESS);
          uploadTaskSnapshot.bytesTransferred.should.eql(uploadTaskSnapshot.totalBytes);
          uploadTaskSnapshot.metadata.should.be.an.Object();
          uploadTaskSnapshot.downloadURL.should.be.a.String();
          resolve();
        }, reject);

        const failureCb = tryCatch((error) => {
          reject(error);
        }, reject);

        firebase.native.storage().ref('/uploadOk.jpeg').putFile(`${firebase.native.storage.Native.DOCUMENT_DIRECTORY_PATH}/ok.jpeg`).then(successCb).catch(failureCb);
      });
    });
  });

  describe('on()', () => {
    it('should listen to upload state', () => {
      return new Promise((resolve, reject) => {
        const path = `${firebase.native.storage.Native.DOCUMENT_DIRECTORY_PATH}/ok.jpeg`;
        const ref = firebase.native.storage().ref('/uploadOk.jpeg');
        const unsubscribe = ref.putFile(path).on(firebase.native.storage.TaskEvent.STATE_CHANGED, tryCatch((snapshot) => {
          if (snapshot.state === firebase.native.storage.TaskState.SUCCESS) {
            resolve();
          }
        }, reject), tryCatch((error) => {
          unsubscribe();
          reject(error);
        }, reject));
      });
    });
  });
}

export default storageTests;
