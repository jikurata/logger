'use strict';
require('dotenv').config();
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
    this._showTimestamp = true;
    this._isProduction = (process.env.NODE_ENV === 'production') ? true : false;
  }

  log(...args) {
    const s = this[statement](Array.from(args), this.scheme.info);
    console.log(s);
  }

  info(...args) {
    this.log(args);
  }

  warn(...args) {
    const s = this[statement](Array.from(args), this.scheme.warn);
    console.log(s);
  }

  error(...args) {
    const s = this[statement](Array.from(args), this.scheme.warn);
    console.error(s);
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
    if ( this.isProduction ) this.record(s);
    return s.replace(/\s+/g, ' ');
  }

  [formatArguments](args) {
    args.forEach(arg => {
      if (typeof arg === 'object' ) s += this.formatObject();
      else s += ` ${arg} `;
    });
  }

  formatObject(o) {
    let s = '';
    if ( o !== null && typeof o === 'object' ) {
      if ( arg.hasOwnProperty('toString') ) s += ` ${arg.toString()} `;
      else if ( Object.keys(arg).length > 0 ) {
        s += ' { ';
        Object.keys(arg).forEach(prop => s += `${prop}: ${arg[prop]} `);
        s += '} ';
      }
    }
    else s += ` ${arg} `;
    return s;
  }

  get scheme() {
    return this._scheme;
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

const Logger = {
  info: function( s, logType = '\x1b[32m' ) {
    if ( s !== null && typeof s === 'object' ) {
      if ( s.hasOwnProperty('toString') ) s = s.toString();
      else Object.keys(s).forEach(key => {

      }) 0 ) s += '\n' + JSON.stringify( s, null, '' );
    }
    const timestamp = formatDate(new Date().toString());
    console.log('[', logType, timestamp, '\x1b[0m', '] ' + s );
  },

  warn: function( s ) {
    this.info( s, '\x1b[1m\x1b[35m' );
  },

  error: function( s ) {
    this.info( s, '\x1b[1m\x1b[31m' );
  },

  log: function( s, timestamp = null ) {
    if ( !timestamp ) timestamp = formatDate(new Date().toString());
    let stream = fs.createWriteStream('event.log', {flags: 'a'});
      stream.write('[' + timestamp + '] ' + s + '\n');
      stream.end();
  }
}

module.exports = Logger;
