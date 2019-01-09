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
    this._logPath = (process.env.LOG_PATH) ? process.env.LOG_PATH : 'logger.log';
    this._printMessage = true;
    this._showTimestamp = true;
    this._recordLog = (process.env.RECORD_LOG === 'true') ? true : false;
  }

  log(...args) {
    const s = this[statement](Array.prototype.slice.call(args), this.scheme.info);
    if ( this.printMessage ) console.log(s);
    return s;
  }

  info(...args) {
    return this.log(...args);
  }

  warn(...args) {
    const s = this[statement](Array.prototype.slice.call(args), this.scheme.warn);
    if ( this.printMessage ) console.log(s);
    return s;
  }

  error(...args) {
    const s = this[statement](Array.prototype.slice.call(args), this.scheme.error);
    if ( this.printMessage ) console.error(s);
    return s;
  }

  record(s) {
    let stream = fs.createWriteStream(this.logPath, {flags: 'a'});
    stream.write(`${s}\n`);
    stream.end();
  }

  [statement](args, type) {
    const msg = this[formatArguments](args);
    const t = new Timestamp();
    let s = '';
    if ( this.showTimestamp ) {
      s = `[${type}${t.format()}${this.scheme.default}] ${msg}`;
    }
    else {
      s = `${type}${msg}${this.scheme.default}`;
    }
    s = s.trim().replace(/\s+/g, ' ');
    if ( this.recordLog ) this.record(`[${t.format()}] ${msg}`);
    return s;
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

  get logPath() {
    return this._logPath;
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

  get recordLog() {
    return this._recordLog;
  }

  set recordLog(boolean) {
    this._recordLog = boolean;
  }
}

module.exports = Logger;
