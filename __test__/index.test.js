'use strict';
const fs = require('fs');
const Logger = require('../index.js');

describe('Functional tests', () => {
  Logger.showTimestamp = false;
  Logger.recordLog = false;
  Logger.printMessage = false;
  describe('info logging', () => {
    test('Appends \x1b[32m to the message', () => {
      const x = 5;
      const s = Logger.info('x:', x);
      expect(s).toMatch('\x1b[32m');
    });
  });
  describe('warn logging', () => {
    test('Appends \x1b[35m to the message', () => {
      const y = 5;
      const s = Logger.warn('y:', y);
      expect(s).toMatch('\x1b[35m');
    });
  });
  describe('error logging', () => {
    test('', () => {
      const e = new Error('this is an error');
      expect(Logger.error(e)).toMatch('Error: this is an error');
    });
  });
  describe('format object structures', () => {
    test('Prints [ 1,2 ]', () => {
      const a = [1,2];
      expect(Logger.info(a)).toMatch('[ 1,2 ]');
    });
    test('Prints { foo: 1, bar: 2 }', () => {
      const o = {foo: 1, bar: 2};
      expect(Logger.info(o)).toMatch('{ foo: 1, bar: 2 }');
    });
    test('Prints { 0: 1, foo: bar } and [ "a","b" ]', () => {
      const o = { 0: 1, foo: 'bar' };
      const a = ['a', 'b'];
      expect(Logger.info(o, 'and', a)).toMatch( `{ 0: 1, foo: bar } and [ a,b ]`);
    });
  });
  describe('Records log outputs into a file', () => {
    test('Creates logger.log', () => {
      Logger.recordLog = true;
      Logger.log('foo');
      const exists = fs.existsSync('logger.log');
      if ( exists ) {
        const content = fs.readFileSync('logger.log', {encoding: 'utf8'});
        fs.unlinkSync('logger.log');
      }
      expect(exists).toBe(true);
    });
  });
});
