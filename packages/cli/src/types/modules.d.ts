import { GradleDetails } from './cli';

declare module 'is-git-dirty' {
  function isGitDirty(): boolean;
  export default isGitDirty;
}
