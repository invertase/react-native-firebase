/* eslint-disable no-console */
const { getE2eTestProject, getE2eEmulatorHost } = require('../../app/e2e/helpers');
const http = require('http');

// Call HTTP REST API URL and return JSON response parsed into object
const callRestApi = async function callRestAPI(url, rawResult = false) {
  // const TAG = 'auth::e2e:helpers:callRestApi - ';
  return await new Promise((resolve, reject) => {
    // console.log(TAG + 'making request');
    const req = http.get(url, response => {
      // console.log(TAG + 'callback');
      let data = '';
      response.on('data', chunk => {
        // console.log(TAG + 'request callback response data callback');
        // console.log(TAG + 'data event, got chunk: ' + chunk);
        data += chunk;
      });
      response.on('end', () => {
        // console.log(TAG + 'request callback response end callback');
        if (rawResult) {
          resolve(data);
        } else {
          resolve(JSON.parse(data));
        }
      });
    });
    req.on('error', error => reject(error));
  });
};

exports.getRandomPhoneNumber = function getRandomPhoneNumber() {
  return '+593' + Utils.randString(9, '#19');
};

exports.clearAllUsers = async function clearAllUsers() {
  // console.log('auth::helpers::clearAllUsers');
  try {
    const deleteOptions = {
      method: 'DELETE',
      headers: {
        // Undocumented, but necessary - from Emulator UI network requests
        Authorization: 'Bearer owner',
      },
      port: 9099,
      host: getE2eEmulatorHost(),
      path: '/emulator/v1/projects/' + getE2eTestProject() + '/accounts',
    };
    // console.log('request: ' + JSON.stringify(deleteOptions));
    await new Promise((resolve, reject) => {
      const req = http.request(deleteOptions);
      req.on('error', error => reject(error));
      req.end(resolve());
    });
  } catch (e) {
    console.error('Unable to wipe auth:', e);
    throw e;
  }
};

exports.disableUser = async function disableUser(userId) {
  // console.log('auth::helpers::disableUser on userId: ' + userId);
  const reqBody = JSON.stringify({ disableUser: true, localId: userId });
  try {
    const postOptions = {
      method: 'POST',
      headers: {
        // Undocumented, but necessary - from Emulator UI network requests
        Authorization: 'Bearer owner',
        'Content-Type': 'application/json',
        'Content-Length': reqBody.length,
      },
      port: 9099,
      host: getE2eEmulatorHost(),
      path: '/identitytoolkit.googleapis.com/v1/accounts:update',
    };
    // console.log('request: ' + JSON.stringify(postOptions));
    await new Promise((resolve, reject) => {
      const req = http.request(postOptions);
      req.on('error', error => reject(error));
      req.write(reqBody);
      req.end(resolve());
    });
  } catch (e) {
    console.error('Unable to update user:', e);
    throw e;
  }
};

exports.getLastSmsCode = async function getLastSmsCode(specificPhone) {
  let lastSmsCode = null;
  try {
    // console.log('auth::e2e:helpers:getLastSmsCode - start');
    const getSmsCodesUrl =
      'http://' +
      getE2eEmulatorHost() +
      ':9099/emulator/v1/projects/' +
      getE2eTestProject() +
      '/verificationCodes';

    const responseData = await callRestApi(getSmsCodesUrl);

    // Process the codes, the last one in the array is the one...
    // console.log('getLastSmsCode got ', JSON.stringify(responseData, null, 2));
    const codes = responseData ? responseData.verificationCodes : undefined;
    if (codes && codes.length > 0) {
      if (specificPhone) {
        // roll through backwards (to get last valid code) searching for the specific phone
        for (let i = codes.length - 1; i >= 0 && !lastSmsCode; i--) {
          const codeBlock = codes[i];
          if (codeBlock.phoneNumber === specificPhone) {
            lastSmsCode = codeBlock.code;
          }
        }
      } else {
        lastSmsCode = codes[codes.length - 1].code;
      }
    } else {
      throw new Error('There were no unused verification codes');
    }
  } catch (e) {
    console.error('Unable to get SMS Verification codes', e);
    throw e;
  }
  // console.log('getLastSmsCode returning code: ' + lastSmsCode);
  return lastSmsCode;
};

exports.getLastOob = async function getLastOob(specificEmail) {
  let lastOob = null;
  try {
    // console.log('auth::e2e:helpers:getLastOob - start');
    const getOobCodesUrl =
      'http://' +
      getE2eEmulatorHost() +
      ':9099/emulator/v1/projects/' +
      getE2eTestProject() +
      '/oobCodes';

    const responseData = await callRestApi(getOobCodesUrl);

    // Process the codes, the last one in the array is the one...
    // console.log('getLastOob got ', JSON.stringify(responseData, null, 2));
    const codes = responseData ? responseData.oobCodes : undefined;
    if (codes && codes.length > 0) {
      if (specificEmail) {
        // roll through backwards (to get last valid code) searching for the specific email
        for (let i = codes.length - 1; i >= 0 && !lastOob; i--) {
          const codeBlock = codes[i];
          if (codeBlock.email === specificEmail) {
            lastOob = codeBlock;
          }
        }
      } else {
        lastOob = codes[codes.length - 1];
      }
    } else {
      throw new Error('There were no unused OOB codes');
    }
  } catch (e) {
    console.error('Unable to get Email OOB codes', e);
    throw e;
  }
  // console.log('getLastOob returning code: ' + JSON.stringify(lastOob, null, 2);
  return lastOob;
};

exports.resetPassword = async function resetPassword(oobCode, newPassword) {
  const resetPasswordUrl =
    'http://' +
    getE2eEmulatorHost() +
    ':9099/emulator/action?mode=resetPassword&lang=en&oobCode=' +
    oobCode +
    '&apiKey=fake-api-key&newPassword=' +
    newPassword;
  return await callRestApi(resetPasswordUrl);
};

exports.verifyEmail = async function verifyEmail(oobCode) {
  const verifyEmailUrl =
    'http://' +
    getE2eEmulatorHost() +
    ':9099/emulator/action?mode=verifyEmail&lang=en&oobCode=' +
    oobCode +
    '&apiKey=fake-api-key';
  return await callRestApi(verifyEmailUrl);
};

// This URL comes from the Auth Emulator's oobCode blocks
exports.signInUser = async function signInUser(oobUrl) {
  return await callRestApi(oobUrl, true);
};
