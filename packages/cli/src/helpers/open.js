const { execSync } = require('child_process');

/**
 * Opens a url in the users default browser. If the user is on OSX and
 * using chrome, this method will attempt to reuse an existing tab on chrome.
 * @param url
 * @returns {*|void}
 */
exports.openUrl = function openUrl(url) {
  const encoded = encodeURI(url);
  const open = require('opn');

  if (process.platform !== 'darwin') {
    return open(encoded);
  }

  // try reuse existing tab on OS X Google Chrome with AppleScript
  try {
    execSync('ps cax | grep "Google Chrome"');
    execSync(`osascript openChrome.applescript "${url}"`, {
      cwd: `${__dirname}/scripts`,
      stdio: 'ignore',
    });
  } catch (err) {
    // ignore errors.
  }
};
