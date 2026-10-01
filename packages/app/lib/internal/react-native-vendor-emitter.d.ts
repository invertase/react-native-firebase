declare module 'react-native/Libraries/vendor/emitter/EventEmitter' {
  export default class EventEmitter {
    addListener(
      eventType: string,
      listener: (...args: Array<unknown>) => unknown,
      context?: unknown,
    ): { remove(): void };
    removeAllListeners(eventType?: string): void;
    emit(eventType: string, ...args: Array<unknown>): void;
  }
}
