import { getNativeModule } from '../../utils/native';
export default class IOSNotifications {
  constructor(notifications) {
    this.shouldAutoComplete = true;
    const nativeModule = getNativeModule(notifications);
    this._backgroundFetchResult = {
      noData: nativeModule.backgroundFetchResultNoData,
      newData: nativeModule.backgroundFetchResultNewData,
      failure: nativeModule.backgroundFetchResultFailed
    };
  }

  get backgroundFetchResult() {
    return { ...this._backgroundFetchResult
    };
  }

}