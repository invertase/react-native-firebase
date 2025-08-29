const { getE2eTestProject } = require('../../app/e2e/helpers');

exports.updateTemplate = async function updateTemplate(operations) {
  let doc = undefined;
  let retries = 0;
  let maxRetries = 5;
  // We handle 429 errors in a retry loop
  while ((doc === undefined || doc.status === 429) && retries < maxRetries) {
    doc = await fetch(
      // 'https://httpbin.org/status/429',
      'https://us-central1-' +
        getE2eTestProject() +
        '.cloudfunctions.net/testFunctionRemoteConfigUpdateV2',
      {
        method: 'post',
        body: JSON.stringify({ data: operations }),
        headers: { 'Content-Type': 'application/json' },
      },
    );
    if (doc.status === 429) {
      // We have been delayed by concurrency limits or rate limits
      // We'll sleep for a little bit then try again.
      const delayRequired = 10;
      await new Promise(r => setTimeout(r, delayRequired * 1000));
    }
    retries++;
  }

  // did we eventually have success? If not, error.
  if (retries === maxRetries && doc.status !== 200) {
    throw new Error('Unable to execute cloud remote config helper function');
  }
  const result = await doc.json();
  // console.error('received: ' + JSON.stringify(result));
  return result;
};
