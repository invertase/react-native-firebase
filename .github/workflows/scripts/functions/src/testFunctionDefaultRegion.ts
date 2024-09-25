/*
 *
 *  Testing tools for invertase/react-native-firebase use only.
 *
 *  Copyright (C) 2018-present Invertase Limited <oss@invertase.io>
 *
 *  See License file for more information.
 */

import * as assert from 'assert';
import { FirebaseError } from 'firebase-admin';
import * as functions from 'firebase-functions/v2';
import SAMPLE_DATA from './sample-data';
import { CallableRequest } from 'firebase-functions/v2/https';

export const testFunctionDefaultRegionV2 = functions.https.onCall(
  (req: CallableRequest<{ type: string; asError: boolean; inputData: any }>) => {
    console.log(Date.now(), req.data);

    if (typeof req.data === 'undefined') {
      return 'undefined';
    }

    if (typeof req.data === 'string') {
      return 'string';
    }

    if (typeof req.data === 'number') {
      return 'number';
    }

    if (typeof req.data === 'boolean') {
      return 'boolean';
    }

    if (req.data === null) {
      return 'null';
    }

    if (Array.isArray(req.data)) {
      return 'array';
    }

    const { type, asError, inputData } = req.data;
    if (!Object.hasOwnProperty.call(SAMPLE_DATA, type)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid test requested.');
    }

    const outputData = SAMPLE_DATA[type];

    try {
      assert.deepEqual(outputData, inputData);
    } catch (e) {
      console.error(e);
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Input and Output types did not match.',
        (e as FirebaseError).message,
      );
    }

    // all good
    if (asError) {
      throw new functions.https.HttpsError(
        'cancelled',
        'Response data was requested to be sent as part of an Error payload, so here we are!',
        outputData,
      );
    }

    return outputData;
  },
);
