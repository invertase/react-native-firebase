import { execSync } from 'child_process';

/**
 * Opens a url in the users default browser. If the user is on OSX and
 * using chrome, this method will attempt to reuse an existing tab on chrome.
 * @param url
 * @returns {*|void}
 */
function openUrl(url: string) {
    const open = require('open');

    if (process.platform !== 'darwin') {
        return open(url);
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
}

export default {
    openUrl,
};
