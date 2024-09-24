/*
 *
 *  Testing tools for invertase/react-native-firebase use only.
 *
 *  Copyright (C) 2018-present Invertase Limited <oss@invertase.io>
 *
 *  See License file for more information.
 */
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v2';
import { CallableRequest } from 'firebase-functions/v2/https';

admin.initializeApp();
const remoteConfig = admin.remoteConfig();

export const testFunctionRemoteConfigUpdateV2 = functions.https.onCall(
  (
    req: CallableRequest<{
      operations: {
        delete: string[] | undefined;
        add: { name: string; value: string }[] | undefined;
        update: { name: string; value: string }[] | undefined;
      };
    }>,
  ) => {
    console.log(Date.now(), req);

    return new Promise(function (resolve, reject) {
      remoteConfig
        .getTemplate()
        .then((template: any) => {
          console.log('received template version: ' + JSON.stringify(template.version));
          // console.log('received template: ' + JSON.stringify(template, null, 2));

          if (req.data?.operations['delete'] !== undefined) {
            const deletions = req.data?.operations['delete'];
            deletions.forEach((deletion: string) => {
              console.log('deleting key: ' + deletion);
              if (template.parameters?.deletion !== undefined) {
                delete template.parameters.deletion;
              }
            });
          }

          if (req.data?.operations['add'] !== undefined) {
            const adds = req.data?.operations['add'];
            adds.forEach((add: { name: string; value: any }) => {
              console.log('adding key: ' + JSON.stringify(add));
              template.parameters[add.name] = {
                description: 'realtime test parameter',
                defaultValue: {
                  value: add.value,
                },
              };
            });
          }

          if (req.data?.operations['update'] !== undefined) {
            const updates = req.data?.operations['update'];
            updates.forEach((update: { name: string; value: any }) => {
              console.log('updating key: ' + JSON.stringify(update));
              if (template.parameters[update.name] !== undefined) {
                template.parameters[update.name].defaultValue = update.value;
              }
            });
          }

          // validate the template
          remoteConfig.validateTemplate(template).then(template => {
            console.log('template is valid after updates.');
            remoteConfig.publishTemplate(template).then(template => {
              console.log('template published, new version: ' + JSON.stringify(template.version));
              resolve({ templateVersion: template.version?.versionNumber });
            });
          });
        })
        .catch((err: string) => {
          console.error('remoteConfig.getTemplate failure: ' + err);
          reject({ status: 'failure', message: err });
        });
    });
  },
);
