const shell = require('shelljs');

const WATCH_SRC = require('path').resolve('./lib');
const WATCH_OUT = require('path').resolve('./tests/firebase');

/*
    "tests-watch-init": "wml add $(node --eval \"console.log(require('path').resolve('./lib'));\") $(node --eval \"console.log(require('path').resolve('./tests/firebase'));\")",
    "tests-watch-start": "watchman watch $(node --eval \"console.log(require('path').resolve('./lib'));\") && wml start",
    "tests-watch-stop": "watchman watch-del $(node --eval \"console.log(require('path').resolve('./lib'));\") && wml stop"
 */

if (process.argv.includes('watch')) {
  if (!shell.which('wml')) {
    shell.echo('');
    shell.echo('---------------------------------------------------');
    shell.echo(' Missing required npm global from library wix/wml. ');
    shell.echo('---------------------------------------------------');
    shell.echo('');
    shell.exit(1);
  }

  if (!shell.which('watchman')) {
    shell.echo('');
    shell.echo('---------------------------------------------------');
    shell.echo('   Missing required executable: watchman           ');
    shell.echo('---------------------------------------------------');
    shell.echo('');
    shell.exit(1);
  }

  if (process.argv.includes('init')) {
    console.log(`wml add ${WATCH_SRC} ${WATCH_OUT}`);
    if (shell.exec(`wml add ${WATCH_SRC} ${WATCH_OUT}`).code !== 0) {
      shell.echo('Error setting up watched location via WML.');
      shell.exit(1);
    }
  }

  if (process.argv.includes('start')) {
    console.log(`watchman watch ${WATCH_SRC} && wml start`);
    const watcher = shell.exec(`watchman watch ${WATCH_SRC} && wml start`, { async: true });
    watcher.stdout.on('data', console.log);
    watcher.stderr.on('data', console.error);
  }

  if (process.argv.includes('stop')) {
    console.log(`watchman watch-del ${WATCH_SRC} && wml stop && wml rm all`);
    const watcher = shell.exec(`watchman watch-del ${WATCH_SRC} && wml stop && wml rm all`, { async: true });
    watcher.stdout.on('data', console.log);
    watcher.stderr.on('data', console.error);
  }
}
