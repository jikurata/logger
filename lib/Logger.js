'use strict';
const fs = require('fs');
const Timestamp = require('./Timestamp.js');
const formatArguments = Symbol('formatArguments');
const statement = Symbol('statement');
let instance = null;

class Logger {
  constructor() {
    if ( instance ) return instance;
    instance = this;
    this._scheme = {
      'default': '\x1b[0m',
      'info': '\x1b[32m',
      'warn': '\x1b[1m\x1b[35m',
      'error': '\x1b[1m\x1b[31m'
    };
    this._printMessage = true;
    this._showTimestamp = true;
    this._isProduction = (process.env.NODE_ENV === 'production') ? true : false;
  }

  log(...args) {
    const s = this[statement](Array.prototype.slice.call(args), this.scheme.info);
    console.log(s);
    return s;
  }

  info(...args) {
    return this.log(...args);
  }

  warn(...args) {
    const s = this[statement](Array.prototype.slice.call(args), this.scheme.warn);
    console.log(s);
    return s;
  }

  error(...args) {
    const s = this[statement](Array.prototype.slice.call(args), this.scheme.error);
    console.error(s);
    return s;
  }

  record(s) {
    let stream = fs.createWriteStream('logger.log', {flags: 'a'});
    stream.write(`${s}\n`);
    stream.end();
  }

  [statement](args, type) {
    let s = this[formatArguments](args);
    if ( this.showTimestamp ) {
      const t = new Timestamp();
      s = `[${type}${t.format()}${this.scheme.default}] ${s}`;
    }
    else {
      s = `${type}${s}${this.scheme.default}`;
    }
    if ( this.isProduction ) this.record(s);
    return s.trim().replace(/\s+/g, ' ');
  }

  [formatArguments](args) {
    let s = '';
    args.forEach(arg => {
      if ( typeof arg === 'object' ) s += this.formatObject(arg);
      else s += ` ${arg} `;
    });
    return s;
  }

  formatObject(o) {
    let s = '';
    if ( o !== null && typeof o === 'object' ) {
      if ( o instanceof Error ) {
        s += `${o.stack}`;
      }
      else if ( Array.isArray(o) ) {
        s += `[ ${o.join(',')} ]`;
      }
      else if ( Object.keys(o).length > 0 ) {
        s += ' { ';
        const keys = Object.keys(o);
        let i = 1;
        keys.forEach(prop => {
          s += `${prop}: ${o[prop]}${(i < keys.length) ? ',' : ''} `;
          ++i;
        });
        s += ' } ';
      }
    }
    else s += ` ${o} `;
    return s;
  }

  get scheme() {
    return this._scheme;
  }

  get printMessage() {
    return this._printMessage;
  }

  set printMessage(boolean) {
    this._printMessage = boolean;
  }

  get showTimestamp() {
    return this._showTimestamp;
  }

  set showTimestamp(boolean) {
    this._showTimestamp = boolean;
  }

  get isProduction() {
    return this._isProduction;
  }
}

module.exports = Logger;
