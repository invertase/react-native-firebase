import React, { useState } from 'react';
import { Button, Text, View, ScrollView, StyleSheet } from 'react-native';

import { getApp, utils } from '@react-native-firebase/app';

import {
  getStorage,
  connectStorageEmulator,
  ref,
  uploadString,
  writeToFile,
  putFile,
  TaskState,
} from '@react-native-firebase/storage';

const storage = getStorage();
connectStorageEmulator(storage, 'localhost', 9199);

const secondStorageBucket = 'gs://react-native-firebase-testing';
const secondStorage = getStorage(getApp(), secondStorageBucket);
connectStorageEmulator(secondStorage, 'localhost', 9199);

export function StorageTestComponent(): React.JSX.Element {
  const [responseData, setResponseData] = useState<string>('');

  const clearAndSetResponse = (data: string): void => {
    setResponseData('');
    setTimeout(() => setResponseData(data), 100);
  };

  const handleUploadString = async (): Promise<void> => {
    try {
      const secondStorage = getStorage(getApp(), secondStorageBucket);
      clearAndSetResponse('Uploading string...');
      const storageReference = ref(secondStorage, 'only-second-bucket/ok.txt');
      const snapshot = await uploadString(storageReference, 'Hello World');
      clearAndSetResponse(
        JSON.stringify(
          {
            success: true,
            state: snapshot.state,
            metadata: snapshot.metadata,
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
          },
          null,
          2,
        ),
      );
    } catch (error: any) {
      clearAndSetResponse(
        JSON.stringify(
          {
            success: false,
            error: error.message,
            code: error.code,
          },
          null,
          2,
        ),
      );
    }
  };

  const handleUploadStringUnauthorized = async (): Promise<void> => {
    try {
      clearAndSetResponse('Testing unauthorized upload...');
      const storageReference = ref(secondStorage, 'react-native-firebase-testing/should-fail.txt');
      await uploadString(storageReference, 'Hello World');
      clearAndSetResponse(
        JSON.stringify(
          {
            success: false,
            error: 'Expected error but upload succeeded',
          },
          null,
          2,
        ),
      );
    } catch (error: any) {
      clearAndSetResponse(
        JSON.stringify(
          {
            success: true,
            error: error.message,
            code: error.code,
            expectedError: error.code === 'storage/unauthorized',
          },
          null,
          2,
        ),
      );
    }
  };

  const handleDownloadFile = async (): Promise<void> => {
    try {
      clearAndSetResponse('Downloading file...');
      const storageRef = ref(storage, 'ok.jpeg');
      const path = `${utils.FilePath.DOCUMENT_DIRECTORY}/onDownload.jpeg`;

      await new Promise<void>((resolve, reject) => {
        const task = writeToFile(storageRef, path);
        const unsubscribe = task.on('state_changed', {
          next: snapshot => {
            if (snapshot.state === TaskState.SUCCESS) {
              clearAndSetResponse(
                JSON.stringify(
                  {
                    success: true,
                    state: snapshot.state,
                    bytesTransferred: snapshot.bytesTransferred,
                    totalBytes: snapshot.totalBytes,
                    localPath: path,
                  },
                  null,
                  2,
                ),
              );
              unsubscribe();
              resolve();
            }
          },
          error: (error: any) => {
            unsubscribe();
            clearAndSetResponse(
              JSON.stringify(
                {
                  success: false,
                  error: error.message,
                  code: error.code,
                },
                null,
                2,
              ),
            );
            reject(error);
          },
        });
      });
    } catch (error: any) {
      clearAndSetResponse(
        JSON.stringify(
          {
            success: false,
            error: error.message,
            code: error.code,
          },
          null,
          2,
        ),
      );
    }
  };

  const handleUploadFile = async (): Promise<void> => {
    try {
      clearAndSetResponse('Uploading file...');
      const path = `${utils.FilePath.DOCUMENT_DIRECTORY}/onDownload.gif`;
      const storageRef = ref(storage, 'uploadOk.jpeg');

      await new Promise<void>((resolve, reject) => {
        const task = putFile(storageRef, path);
        const unsubscribe = task.on('state_changed', {
          next: snapshot => {
            if (snapshot.state === TaskState.SUCCESS) {
              clearAndSetResponse(
                JSON.stringify(
                  {
                    success: true,
                    state: snapshot.state,
                    bytesTransferred: snapshot.bytesTransferred,
                    totalBytes: snapshot.totalBytes,
                    metadata: snapshot.metadata,
                  },
                  null,
                  2,
                ),
              );
              unsubscribe();
              resolve();
            }
          },
          error: (error: any) => {
            unsubscribe();
            clearAndSetResponse(
              JSON.stringify(
                {
                  success: false,
                  error: error.message,
                  code: error.code,
                },
                null,
                2,
              ),
            );
            reject(error);
          },
        });
      });
    } catch (error: any) {
      clearAndSetResponse(
        JSON.stringify(
          {
            success: false,
            error: error.message,
            code: error.code,
          },
          null,
          2,
        ),
      );
    }
  };

  const handleUploadStringWithObserver = async (): Promise<void> => {
    try {
      clearAndSetResponse('Uploading string with observer...');
      const storageRef = ref(storage, 'playground/putStringBlob.json');

      await new Promise<void>((resolve, reject) => {
        const uploadTaskSnapshot = uploadString(
          storageRef,
          'Just a string to put in a file for upload',
        );

        const unsubscribe = uploadTaskSnapshot.on('state_changed', {
          next: snapshot => {
            if (snapshot.state === TaskState.SUCCESS) {
              clearAndSetResponse(
                JSON.stringify(
                  {
                    success: true,
                    state: snapshot.state,
                    bytesTransferred: snapshot.bytesTransferred,
                    totalBytes: snapshot.totalBytes,
                    metadata: snapshot.metadata,
                    snapshotAvailable: !!snapshot,
                  },
                  null,
                  2,
                ),
              );
              unsubscribe();
              resolve();
            }
          },
          error: (error: any) => {
            unsubscribe();
            clearAndSetResponse(
              JSON.stringify(
                {
                  success: false,
                  error: error.message,
                  code: error.code,
                },
                null,
                2,
              ),
            );
            reject(error);
          },
        });
      });
    } catch (error: any) {
      clearAndSetResponse(
        JSON.stringify(
          {
            success: false,
            error: error.message,
            code: error.code,
          },
          null,
          2,
        ),
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Storage Test</Text>
      <Text style={styles.subtitle}>Ensure Emulator is running!!</Text>

      <View style={styles.buttonContainer}>
        <Button title="Upload String" onPress={handleUploadString} />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Test Unauthorized" onPress={handleUploadStringUnauthorized} />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Download File" onPress={handleDownloadFile} />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Upload File" onPress={handleUploadFile} />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Upload String (Observer)" onPress={handleUploadStringWithObserver} />
      </View>

      {responseData ? (
        <ScrollView style={styles.responseBox}>
          <Text style={styles.responseText}>{responseData}</Text>
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  buttonContainer: {
    marginBottom: 10,
  },
  responseBox: {
    marginTop: 20,
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    padding: 15,
    maxHeight: 400,
  },
  responseText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
  },
});
