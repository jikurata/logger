'use strict';
const EventEmitter = require('events');
const State = require('./State.js');
const Log = require('./Log.js');
const statement = Symbol('statement');
const formatArguments = Symbol('formatArguments');
const formatObject = Symbol('formatObject');
const createLog = Symbol('createLog');

let instance = null;

class Logger extends EventEmitter {
  constructor() {
    if ( instance ) return instance;
    super();
    instance = this;
    Object.defineProperty(this, 'id', {
      value: process.pid,
      enumerable: true,
      writable: false,
      configurable: false
    });
    Object.defineProperty(this, 'state', {
      value: new State({
        'LOG_SIZE': 50,
        'DEFAULT_LOG_COLOR': '\x1b[0m',
        'INFO_LOG_COLOR': '\x1b[32m',
        'WARN_LOG_COLOR': '\x1b[1m\x1b[35m',
        'ERROR_LOG_COLOR': '\x1b[1m\x1b[31m',
        'PRINT_MESSAGE': true,
        'SHOW_TIMESTAMP': true,
        'EMIT_LOG': true
      }),
      enumerable: true,
      writable: false,
      configurable: false
    });
    Object.defineProperty(this, 'history', {
      value: [],
      enumerable: true,
      writable: false,
      configurable: false
    });
  }

  /**
   * Alias for info
   * @param  {...any} args 
   */
  log(...args) {
    return this.info(...args);
  }

  info(...args) {
    const log = this[createLog]('info', args);
    if ( this.printMessage ) {
      const s = this[statement](log);
      process.stdout.write(s);
    }
    return log;
  }

  warn(...args) {
    const log = this[createLog]('warn', args);
    if ( this.printMessage ) {
      const s = this[statement](log);
      process.stderr.write(s);
    }
    return log;
  }

  error(...args) {
    const log = this[createLog]('error', args);
    if ( this.printMessage ) {
      const s = this[statement](log);
      process.stderr.write(s);
    }
    return log;
  }

  [createLog](type, args) {
    const t = Date.now();
    const msg = this[formatArguments](args);
    const log = new Log(type, t, msg);
    // Add log to history
    this.history.push(log);
    // Remove the first entry while the current size exceeds the history limit
    let count = this.history.length - this.state.LOG_SIZE;
    if ( count > 0 ) for ( count; count--; ) this.history.shift();
    if ( this.emitLog ) this.emit('log', log);
    return log;
  }

  [statement](log) {
    let s = '';
    let code = this.state.DEFAULT_LOG_COLOR;
    // Set the print color of the message
    switch(log.type) {
    case 'info': 
      code = this.state.INFO_LOG_COLOR
      break;
    case 'warn':
      code = this.state.WARN_LOG_COLOR;
      break;
    case 'error':
      code = this.state.ERROR_LOG_COLOR;
      break;
    default: break;
    }
    if ( this.showTimestamp ) {
      // Convert the timestamp into a readable format
      const ts = new Date(log.timestamp).toString().split(' ').slice(1, 6).join(' ');
      s = `[${code}${ts}${this.state.DEFAULT_LOG_COLOR}] ${log.message}`;
    }
    else s = `${code}${log.message}${this.state.DEFAULT_LOG_COLOR}`;
    return s + '\n';
  }

  [formatArguments](args) {
    let s = '';
    args.forEach(arg => {
      if ( typeof arg === 'object' ) s += this[formatObject](arg);
      else s += ` ${arg} `;
    });
    s = s.trim().replace(/\s+/g, ' ');
    return s;
  }

  [formatObject](o) {
    let s = '';
    if ( o !== null && typeof o === 'object' ) {
      if ( o instanceof Error ) s += `${o.stack}`;
      else if ( Array.isArray(o) ) s += `[ ${o.join(',')} ]`;
      else if ( Object.keys(o).length > 0 ) {
        s += ' { ';
        const keys = Object.keys(o);
        let i = 1;
        keys.forEach(prop => {
          s += `${prop}: ${o[prop]}${(i < keys.length) ? ',' : ''} `;
          ++i;
        });
        s += '} ';
      }
    }
    else s += ` ${o} `;
    return s;
  }

  get historyLimit() {
    return this.state.LOG_SIZE;
  }

  set historyLimit(num) {
    if ( num > -1 ) this.state.LOG_SIZE = num;
  }

  get printMessage() {
    return this.state.PRINT_MESSAGE;
  }

  set printMessage(bool) {
    this.state.PRINT_MESSAGE = !!bool;
  }

  get showTimestamp() {
    return this.state.SHOW_TIMESTAMP;
  }

  set showTimestamp(bool) {
    this.state.SHOW_TIMESTAMP = !!bool;
  }

  get emitLog() {
    return this.state.EMIT_LOG;
  }

  set emitLog(bool) {
    this.state.EMIT_LOG = !!bool;
  }
}

module.exports = Logger;
