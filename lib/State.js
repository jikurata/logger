'use strict';
const map = Symbol('map');

/**
 * A State object is intended to handle type String keys
 * and primitive type values
 */
class State {
  constructor(o = {}) {
    this[map] = {};
    this.setAll(o);
  }

  /**
   * Generates a getter and setter for the key on the State object
   * The value is stored in the map Symbol
   * @param {String} k 
   * @param {*} v 
   */
  set(k, v) {
    if ( !this[map].hasOwnProperty(k) ) {
      Object.defineProperty(this, k, {
        configurable: false,
        get: () => this[map][k],
        set: (val) => this.set(k, val)
      });
    }
    // Overwrite only when the value is different from the previous value
    const oldVal = this[map][k];
    if ( v !== oldVal ) this[map][k] = v;
  }

  setAll(o) {
    const keys = Object.keys(o);
    for ( let i = 0; i < keys.length; ++i ) this.set(keys[i], o[keys[i]]);
  }

  remove(k) {
    if ( this.has(k) ) {
      delete this[k];
      delete this[map][k];
    }
  }

  has(k) {
    return this[map].hasOwnProperty(k);
  }

  toObject() {
    return this[map];
  }

  keys() {
    return Object.keys(this[map]);
  }
}

module.exports = State;
