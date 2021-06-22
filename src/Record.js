'use strict';

class Record {
  constructor(o = {}) {
    Object.defineProperty(this, 'type', {
      value: o.type,
      enumerable: true,
      writable: false,
      configurable: false
    });
    Object.defineProperty(this, 'timestamp', {
      value: o.timestamp,
      enumerable: true,
      writable: false,
      configurable: false
    });
    Object.defineProperty(this, 'message', {
      value: o.message,
      enumerable: true,
      writable: false,
      configurable: false
    });
    Object.defineProperty(this, 'colored', {
      value: o.colored,
      enumerable: true,
      writable: false,
      configurable: false
    });
  }
}

module.exports = Record;
