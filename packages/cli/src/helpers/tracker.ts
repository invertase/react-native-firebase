import { PathLike } from 'fs';
import isGitDirty from 'is-git-dirty';
import log from '../helpers/log';
import CliError from './error';
import box from './box';

interface CliGlobal extends NodeJS.Global {
  filesModified: undefined | Set<PathLike>;
}

declare const global: CliGlobal;

// only if we expect files to possibly be changed during this run
export function trackModified(force = false) {
  if (global.filesModified)
    throw new Error('trackModified() has already been called and can only be called once');

  if (force)
    box.warn(
      'You have opted to skip safety checks, this command may cause you to lose pending changes.',
    );
  else if (isGitDirty())
    throw new CliError(
      'You have pending changes, please stash or commit your changes then try again.',
    );

  global.filesModified = new Set();
}

export function addModified(file: PathLike) {
  if (!global.filesModified)
    throw new Error('trackModified() must be called before tracking any files');
  global.filesModified.add(file);
}

export function reportModified() {
  if (global.filesModified) {
    if (global.filesModified.size) {
      log.info(
        `The following ${global.filesModified.size} file(s) have been modified:\n${[
          ...global.filesModified,
        ].join('\n')}`,
      );
    } else log.info('No files have been modified.');
  }
  // no output if files weren't expected to change during run
}
