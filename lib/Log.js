'use strict';

class Log {
  constructor(type, timestamp, message) {
    Object.defineProperty(this, 'type', {
      value: type,
      enumerable: true,
      writable: false,
      configurable: false
    });
    Object.defineProperty(this, 'timestamp', {
      value: timestamp,
      enumerable: true,
      writable: false,
      configurable: false
    });
    Object.defineProperty(this, 'message', {
      value: message,
      enumerable: true,
      writable: false,
      configurable: false
    });
  }
}

module.exports = Log;
