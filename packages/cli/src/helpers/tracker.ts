import { PathLike } from 'fs';
import isGitDirty from 'is-git-dirty';
import log from '../helpers/log';
import CliError from './error';

interface cliGlobal extends NodeJS.Global {
  filesModified: undefined | PathLike[];
}

declare const global: cliGlobal;

// only if we expect files to possibly be changed during this run
export function trackModified(force: Boolean = false) {
  if (global.filesModified)
    throw new Error('trackModified() has already been called and can only be called once');
  if (!force && isGitDirty())
    throw new CliError(
      'You have uncomitted files, please stash or commit your changes then try again.',
    );
  global.filesModified = [];
}

export function addModified(file: PathLike) {
  if (!global.filesModified)
    throw new Error('trackModified() must be called before tracking any files');
  global.filesModified.push(file);
}

export function reportModified() {
  if (global.filesModified) {
    if (global.filesModified.length) {
      log.info(
        `The following ${
          global.filesModified.length
        } file(s) have been modified:\n${global.filesModified.join('\n')}`,
      );
      global.filesModified.map(file => file.toString());
    } else log.info('No files have been modified.');
  }
  // no output if files weren't expected to change during run
}
