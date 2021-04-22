// @ts-ignore importing the EventEmitter directly.
import Emitter from 'react-native/Libraries/vendor/emitter/EventEmitter';
import { EventEmitter } from 'react-native';
// Cast the event emitter type.
const SharedEventEmitter = Emitter as typeof EventEmitter;

export default new SharedEventEmitter();
