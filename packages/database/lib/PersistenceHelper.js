import { NativeModules } from 'react-native';

export default class FireCacheSwitch {
    constructor() {
        this.native = NativeModules.RNFBDatabaseQueryModule;
    }

    turnOnPersistence(dbURL) {
        return this.native.turnOnFirePersistence(dbURL);
    }
}