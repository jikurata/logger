'use strict';
const EventEmitter = require('events');
const InputStream = require('./InputStream.js');
const State = require('./State.js');
const Record = require('./Record.js');
const init = Symbol('init');
const statement = Symbol('statement');
const formatArguments = Symbol('formatArguments');
const format = Symbol('format');
const createRecord = Symbol('createRecord');

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
    Object.defineProperty(this, 'stream', {
      value: new InputStream(),
      enumerable: true,
      writable: false,
      configurable: false 
    });
    Object.defineProperty(this, 'state', {
      value: new State({
        'HISTORY_LIMIT': 50,
        'DEFAULT_LOG_COLOR': '\x1b[0m',
        'INFO_LOG_COLOR': '\x1b[32m',
        'WARN_LOG_COLOR': '\x1b[1m\x1b[35m',
        'ERROR_LOG_COLOR': '\x1b[1m\x1b[31m',
        'PRINT_MESSAGE': true,
        'SHOW_TIMESTAMP': true,
        'SHOW_TIMEZONE': true,
        'EMIT_LOG': true,
        'ARRAY_FORMAT': {
          'depth': 2,
          'newline': false
        },
        'OBJECT_FORMAT': {
          'depth': 2,
          'newline': false
        }
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
    this[init]();
  }

  [init]() {
    this.stream.pipe(process.stdout);
  }

  /**
   * Alias for info
   * @param  {...any} args 
   */
  log(...args) {
    return this.info(...args);
  }

  info(...args) {
    const log = this[createRecord]('info', args);
    if ( this.printMessage ) {
      const s = this[statement](log);
      process.stdout.write(s);
    }
    return log;
  }

  warn(...args) {
    const log = this[createRecord]('warn', args);
    if ( this.printMessage ) {
      const s = this[statement](log);
      process.stderr.write(s);
    }
    return log;
  }

  error(...args) {
    const log = this[createRecord]('error', args);
    if ( this.printMessage ) {
      const s = this[statement](log);
      process.stderr.write(s);
    }
    return log;
  }
  
  /**
   * Formats a Record object into a console message
   * @param {Record} record 
   */
  printRecord(record) {
    if ( this.printMessage && record instanceof Record ) {
      const s = this[statement](record);
      process.stdin.write(s);
    }
  }

  [createRecord](type, args) {
    const t = Date.now();
    const msg = this[formatArguments](args);
    const record = new Record(type, t, msg);
    // Add record to history
    this.history.push(record);
    // Remove the first entry while the current size exceeds the history limit
    let count = this.history.length - this.state.HISTORY_LIMIT;
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
      const ts = new Date(log.timestamp).toString().split(' ').slice(1, (this.showTimezone) ? 6 : 5).join(' ');
      s = `[${code}${ts}${this.state.DEFAULT_LOG_COLOR}] ${log.message}`;
    }
    else s = `${code}${log.message}${this.state.DEFAULT_LOG_COLOR}`;
    return s + '\n';
  }

  [formatArguments](args) {
    let s = '';
    args.forEach(arg => s += this[format](arg));
    s = s.trim().replace(/\s+/g, ' ');
    return s;
  }

  [format](arg, depth = 0) {
    let s = '';
    if ( arg === null ) s = 'null';
    else if ( typeof arg === 'function' ) {
      s += `function`;
      if ( arg.name ) s += ` ${arg.name}`;
      s += '(';
      if ( arg.param ) s += `${arg.param}`;
      s += ')';
      if ( arg.statements ) s += `${arg.statement}`;
    }
    else if ( arg instanceof Error ) {
      if ( arg.name ) s += `${arg.name}`;
      if ( arg.code ) s += `(${arg.code}) `;
      if ( arg.message ) s += `${arg.message}`;
      if ( arg.stack ) s += `: ${arg.stack}`;
    }
    else if ( Array.isArray(arg) && depth < this.state.ARRAY_FORMAT.depth ) {
      const space = (this.state.ARRAY_FORMAT.newline) ? '\n' : ' ';
      s += `[${space}`;
      for ( let i = 0; i < arg.length; ++i ) {
        const v = arg[i];
        s += `${this[format](v, ++depth)}`;
        if ( i < arg.length - 1 ) {
          s += `,${space}`;
        }
      }
      s += ']';
    }
    else if ( typeof arg === 'object' && depth < this.state.OBJECT_FORMAT.depth ) {
      const space = (this.state.OBJECT_FORMAT.newline) ? '\n' : ' ';
      s += `{${space}`;
      const keys = Object.keys(arg);
      for ( let i = 0; i < keys.length; ++i ) {
        const key = keys[i];
        s += `${prop}: ${this[format](arg[key], ++depth)}`;
        if ( i < keys.length - 1 ) {
          s += `,${space}`;
        }
      }
      s += '}';
    }
    else s += ` ${o} `;
    return s;
  }

  get historyLimit() {
    return this.state.HISTORY_LIMIT;
  }

  set historyLimit(num) {
    if ( num > -1 ) this.state.HISTORY_LIMIT = num;
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

  get showTimezone() {
    return this.state.SHOW_TIMEZONE;
  }

  set showTimezone(bool) {
    this.state.SHOW_TIMEZONE = !!bool;
  }

  get emitLog() {
    return this.state.EMIT_LOG;
  }

  set emitLog(bool) {
    this.state.EMIT_LOG = !!bool;
  }
}

module.exports = Logger;
