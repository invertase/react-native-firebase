import NativeError from '../../common/NativeError';
import type { SnapshotErrorInterface } from './firestoreTypes.flow';
import type { NativeErrorResponse } from '../../common/commonTypes.flow';

export default class SnapshotError extends NativeError
  implements SnapshotErrorInterface {
  constructor(nativeErrorMap: NativeErrorResponse) {
    super(nativeErrorMap.error);
    this.path = nativeErrorMap.path;
    this.appName = nativeErrorMap.appName;
  }
}
