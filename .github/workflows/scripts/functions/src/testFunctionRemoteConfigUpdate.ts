/*
 *
 *  Testing tools for invertase/react-native-firebase use only.
 *
 *  Copyright (C) 2018-present Invertase Limited <oss@invertase.io>
 *
 *  See License file for more information.
 */
// import * as admin from 'firebase-admin';
import { getRemoteConfig } from 'firebase-admin/remote-config';
import { logger } from 'firebase-functions/v2';
import { CallableRequest, onCall } from 'firebase-functions/v2/https';
import { getAdminApp } from '.';

export const testFunctionRemoteConfigUpdateV2 = onCall(
  async (
    req: CallableRequest<{
      operations: {
        delete: string[] | undefined;
        add: { name: string; value: string }[] | undefined;
        update: { name: string; value: string }[] | undefined;
      };
    }>,
  ) => {
    let template = await getRemoteConfig(getAdminApp()).getTemplate();
    logger.info('received template version: ' + JSON.stringify(template.version));
    // logger.info('received template: ' + JSON.stringify(template, null, 2));

    if (req.data !== undefined && req.data.operations !== undefined) {
      modifyTemplate(req.data, template);
    }

    // validate the template
    template = await getRemoteConfig(getAdminApp()).validateTemplate(template);
    logger.info('template is valid after updates.');
    template = await getRemoteConfig(getAdminApp()).publishTemplate(template);
    logger.info('template published, new version: ' + JSON.stringify(template.version));

    return { templateVersion: template.version?.versionNumber };
  },
);

function modifyTemplate(data: any, template: any) {
  if (data.operations['delete'] !== undefined) {
    const deletions = data.operations['delete'];
    deletions.forEach((deletion: string) => {
      logger.info('deleting key: ' + deletion);
      if (template.parameters?.deletion !== undefined) {
        delete template.parameters.deletion;
      }
    });
  }

  if (data.operations['add'] !== undefined) {
    const adds = data.operations['add'];
    adds.forEach((add: { name: string; value: any }) => {
      logger.info('adding key: ' + JSON.stringify(add));
      template.parameters[add.name] = {
        description: 'realtime test parameter',
        defaultValue: {
          value: add.value,
        },
      };
    });
  }

  if (data.operations['update'] !== undefined) {
    const updates = data.operations['update'];
    updates.forEach((update: { name: string; value: any }) => {
      logger.info('updating key: ' + JSON.stringify(update));
      if (template.parameters[update.name] !== undefined) {
        template.parameters[update.name].defaultValue = update.value;
      }
    });
  }
}
