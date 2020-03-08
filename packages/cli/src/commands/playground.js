module.exports = async function initCommand(args, reactNativeConfig) {
  const firebase = await import('../helpers/firebase');
  let account = firebase.auth.getAccount();
  console.log(account);
};
