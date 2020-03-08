module.exports = async function initCommand(args, reactNativeConfig) {
  const firebase = await import('../helpers/firebase');
  let account = firebase.auth.getAccount();
  const p = await firebase.api(account).management.getProjects();
  console.log(p);
};
