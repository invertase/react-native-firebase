/* eslint-disable no-console */
const { getE2eTestProject } = require('../../app/e2e/helpers');

exports.updateTemplate = async function updateTemplate(operations) {
  // console.error('remoteConfig::helpers::updateTemplate');
  const response = await fetch(
    'https://us-central1-' +
      getE2eTestProject() +
      '.cloudfunctions.net/testFunctionRemoteConfigUpdate',
    {
      method: 'post',
      body: JSON.stringify({ data: operations }),
      headers: { 'Content-Type': 'application/json' },
    },
  );
  const result = await response.json();
  // console.error('received: ' + JSON.stringify(result));
  return result;
};
