'use strict';
const EventEmitter = require('@jikurata/events');
const {format} = require('util');
const State = require('./State.js');
const Record = require('./Record.js');

let instance = null;

class Logger extends EventEmitter {
  constructor() {
    if ( instance ) return instance;
    super();
    instance = this;
    Object.defineProperty(this, 'state', {
      value: new State({
        'HISTORY_LIMIT': 50,
        'COLOR': {
          'default': '\x1b[0m',
          'boolean': '\x1b[38;5;27m',
          'number': '\x1b[38;5;64m',
          'string': '\x1b[38;5;130m',
          'text': '\x1b[38;5;250m',
          'array': '\x1b[38;5;248m',
          'object': '\x1b[38;5;248m',
          'function': '\x1b[38;5;30m',
          'bigint': '\x1b[38;5;179m', 
          'symbol': '\x1b[38;5;99m',
          'property': '\x1b[38;5;75m',
          'undefined': '\x1b[38;5;240m',
          'null': '\x1b[38;5;240m',
          'circular': '\x1b[38;5;171m',
          'info': '\x1b[38;5;28m',
          'warn': '\x1b[38;5;100m',
          'error': '\x1b[38;5;88m',
          'timestamp': '\x1b[38;5;240m'
        },
        'USE_COLORS': true,
        'PRINT_MESSAGE': true,
        'SHOW_TIMESTAMP': true,
        'SHOW_TIMEZONE': false,
        'EMIT_RECORD': true
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
   * @param {String} type
   * @param  {...Any} args 
   */
  _print(type, ...args) {
    const r = this.createRecord(type, ...args);
    this.printRecord(r);
    return r;
  }

  /**
   * @param  {...Any} args
   * @returns {Record}
   */
  log(...args) {
    return this._print('info', ...args);
  }

  /**
   * @param  {...Any} args
   * @returns {Record}
   */
  info(...args) {
    return this._print('info', ...args);
  }

  /**
   * @param  {...Any} args
   * @returns {Record}
   */
  warn(...args) {
    return this._print('warn', ...args);
  }

  /**
   * @param  {...Any} args
   * @returns {Record}
   */
  error(...args) {
    return this._print('error', ...args);
  }

  /**
   * Create a Record object
   * @param {String} type 
   * @param  {...Any} args 
   * @returns {Record}
   */
  createRecord(type, ...args) {
    const t = Date.now();
    const s = this.formatColors(args);
    const record = new Record({
      type: type,
      timestamp: t,
      message: this.removeANSIColors(s),
      colored: s
    });
    // Add record to history
    this.history.push(record);
    // Remove the first entry while the current size exceeds the history limit
    let count = this.history.length - this.state.HISTORY_LIMIT;
    if ( count > 0 ) {
      for ( count; count--; ) {
        this.history.shift();
      }
    }
    if ( this.emitRecord ) {
      this.emit('record', record);
    }
    return record;
  }

  /**
   * Format a record to be printed in console
   * @param {Record} record 
   */
  printRecord(record) {
    if ( !this.printMessage ) {
      return;
    }

    let s = `# `;
    if ( this.showTimestamp ) {
      const ts = new Date(record.timestamp).toString().split(' ').slice(1, (this.showTimezone) ? 6 : 5).join(' ');
      s += `${this.getColor('timestamp')}[${ts}] `;
    }
    s += (this.useColors) ? record.colored : record.message + '\n';
    
    switch(record.type) {
      case 'info': 
        s = `${this.getColor('info')}${s}`;
        return console.info(s);
      case 'warn': 
        s = `${this.getColor('warn')}${s}`;
        return console.warn(s);
      case 'error': 
        s = `${this.getColor('error')}${s}`;
        return console.error(s);
      default: 
        s = `${this.getColor('default')}${s}`
        return console.log(s);
    }
  }

  /**
   * Stringify arguments and append color codes to data types
   * @param {Array<Any>} args
   * @returns {String} 
   */
  formatColors(args) {
    const objStack = [];
    const formatter = (arg) => {
      // Check arg's data type
      const type = this.getDataType(arg);
      const argStr = format(arg);
      if ( type === 'object' ) {
        const objectClass = (arg.constructor && arg.constructor.name) ? arg.constructor.name : '';
        // Check for cyclic references
        if ( objStack.indexOf(arg) === -1 ) {
          objStack.push(arg);
          let substr = '';
          // Format error objects
          if ( arg instanceof Error ) {
            if ( arg.stack ) {
              const split = arg.stack.split(':');
              for ( let i = 0; i < split.length; ++i ) {
                if ( i === 0 ) {
                  substr += `${this.getColor('error')}`;
                }
                else if ( i === 1 ) {
                  substr += `${this.getColor('text')}`;
                }
                substr += `${split[i]}:`;
              }
            }
            else {
              substr = `${this.getColor('error')}${arg.name}: ${this.getColor('text')}${arg.message}`;
            }
          }
          else if ( Array.isArray(arg) ) {
            // Format an array
            substr = `${this.getColor('array')}[ `;
            for ( let i = 0; i < arg.length; ++i ) {
              substr += `${formatter(arg[i])}`;
              substr += (i < arg.length - 1) ? `${this.getColor('array')}, ` : ' ';
            }
            substr += `${this.getColor('array')}]`;
          }
          else {
            // Format a generic object type
            substr = `${this.getColor('object')}${(objectClass && objectClass !== 'Object') ? objectClass + ' ' : ''}{ `;
            const keys = Object.keys(arg);
            for ( let i = 0; i < keys.length; ++i ) {
              const key = keys[i];
              const value = arg[key];
              substr += `${this.getColor('property')}${key}: ${formatter(value)}`;
              substr += (i < keys.length - 1) ? `${this.getColor('object')}, ` : ' ';
            }
            substr += `${this.getColor('object')}}`;
          }

          // Format complete for current object, remove from stack
          objStack.pop();
          return substr;
        }
        else {
          // Object is a cyclic reference
          return `${this.getColor('circular')}[Circular ${(objectClass)}]`;
        }
      }
      else if ( type === 'string' ) {
        // If the string is an object value, use the string color code
        if ( objStack.length ) {
          return `${this.getColor('string')}\'${argStr}${this.getColor('string')}\'`;
        }
        return `${this.getColor('text')}${argStr}`;
      }
      else {
        return `${this.getColor(type)}${argStr}`;
      }
    }

    let a = [];
    for ( let i = 0; i < args.length; ++i ) {
      a.push(formatter(args[i]));
    }

    return format(...a);
  }

  /**
   * Return the data type of arg
   * @param {Any} arg
   * @returns {String}
   */
  getDataType(arg) {
    if ( arg === null ) {
      return 'null';
    }
    else if ( arg === undefined ) {
      return 'undefined';
    }
    else if ( arg && typeof arg === 'object' ) {
      return 'object';
    }
    else {
      return typeof arg;
    }
  }

  /**
   * Get an ANSI color code for the corresponding type
   * @param {String} color 
   * @returns {String}
   */
  getColor(type) {
    return (this.state.COLOR.hasOwnProperty(type)) ? this.state.COLOR[type] : this.state.COLOR.text;
  }

  /**
   * Remove all ANSI escape attribute codes
   * @param {String} s 
   */
   removeANSIColors(s) {
    const matches = s.match(/\x1b\[[\d|;]*m/gmi);
    if ( matches ) {
      for ( let i = 0; i < matches.length; ++i ) {
        s = s.replace(matches[i], '');
      }
    }
    return s;
  }

  get historyLimit() {
    return this.state.HISTORY_LIMIT;
  }

  set historyLimit(num) {
    if ( num > -1 ) this.state.HISTORY_LIMIT = num;
  }

  get useColors() {
    return this.state.USE_COLORS;
  }

  set useColors(bool) {
    this.state.USE_COLORS = !!bool;
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

  get emitRecord() {
    return this.state.EMIT_RECORD;
  }

  set emitRecord(bool) {
    this.state.EMIT_RECORD = !!bool;
  }
}

module.exports = Logger;
