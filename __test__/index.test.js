'use strict';
const Logger = require('../index.js');
Logger.printMessage = false;

describe('Logger stores logs in its history', () => {
  test('Logger history has a length of 1', () => {
    Logger.info('testing log history');
    expect(Logger.history.length).toEqual(1);
  });
});
describe('Logger will clean up its history when exceeding the size limit', () => {
  test('Logger history has a length of 5', () => {
    Logger.historyLimit = 3;
    for ( let i = 6; --i; ) Logger.info(i);
    expect(Logger.history.length).toEqual(3);
  });
});
describe('Format object structures', () => {
  test('Prints [ 1,2 ]', () => {
    const a = [1,2];
    expect(Logger.info(a).message).toMatch('[ 1,2 ]');
  });
  test('Prints { foo: 1, bar: 2 }', () => {
    const o = {foo: 1, bar: 2};
    expect(Logger.info(o).message).toMatch('{ foo: 1, bar: 2 }');
  });
  test('Prints { 0: 1, foo: bar } and [ "a","b" ]', () => {
    const o = { 0: 1, foo: 'bar' };
    const a = ['a', 'b'];
    expect(Logger.info(o, 'and', a).message).toMatch(`{ 0: 1, foo: bar } and [ a,b ]`);
  });
});
