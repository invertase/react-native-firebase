module.exports = async function initCommand(args, reactNativeConfig) {
  const firebase = require('../helpers/firebase');
  let account = firebase.auth.getAccount().then(console.log);
};
