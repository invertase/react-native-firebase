import { PathLike } from 'fs';
import isGitDirty from 'is-git-dirty';
import log from '../helpers/log';

interface cliGlobal extends NodeJS.Global {
  filesChanged: undefined | PathLike[];
}

declare const global: cliGlobal;

// only if we expect files to possibly be changed during this run
export function startTracking(force: Boolean = false) {
  if (global.filesChanged)
    throw new Error('startTracking() has already been called and can only be called once');
  if (!force && isGitDirty())
    throw new Error(
      'You have uncomitted files, please stash or commit your changes then try again.',
    );
  global.filesChanged = [];
}

export function addModified(file: PathLike) {
  if (!global.filesChanged)
    throw new Error('startTracking() must be called before tracking any files');
  global.filesChanged.push(file);
}

export function reportModified() {
  if (global.filesChanged) {
    if (global.filesChanged.length) {
      log.info(`The following ${global.filesChanged.length} files have been modified:`);
      global.filesChanged.forEach(file => log.info(file.toString()));
    } else log.info('No files have been modified.');
  }
  // no output if files weren't expected to change during run
}
