'use strict';

class Timestamp {
  constructor(datetime = null) {
    this._datetime = (datetime) ? new Date(datetime) : new Date();
  }

  /**
   * Formats datetime as a readable string
   */
  format() {
    return this.datetime.split(' ').slice(1, 6).join(' ');
  }

  get datetime() {
    return this._datetime;
  }
}
