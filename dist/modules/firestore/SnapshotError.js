import NativeError from '../../common/NativeError';
export default class SnapshotError extends NativeError {
  constructor(nativeErrorMap) {
    super(nativeErrorMap.error);
    this.path = nativeErrorMap.path;
    this.appName = nativeErrorMap.appName;
  }

}