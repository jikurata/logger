'use strict';
const Taste = require('@jikurata/taste');
const Logger = require('../src/Logger.js');
const Console = new Logger();
Console.printMessage = false;

Taste.flavor('Logger retains is log history')
  .describe('Logger creates a Log object and stores it in its history')
  .test(() => {
    Console.info('testing log history');
    Taste.profile['logHistoryLength'] = Console.history.length;
  })
  .expect('logHistoryLength').toEqual(1);

Taste.flavor('Logger event emitter')
    .describe('Emits log event when a log is created')
    .test(() => {
      Console.info('testing log history');
      Console.on('log', (log) => {
        Taste.profile['logEventEmitted'] = !!log;
      });
    })
    .expect('logEventEmitted').toBeTruthy();
  

Taste.flavor('Logger history limit')
  .describe('Logger deletes the oldest entries until the history length is within the limit')
  .test(() => {
    Console.historyLimit = 3;
    for ( let i = 6; --i; ) Console.info(i);
    Taste.profile['restrictedHistoryLength'] = Console.history.length;
  })
  .expect('restrictedHistoryLength').toEqual(3);

Taste.flavor('Formatting arrays in a log')
  .describe('Prints [ 1,2 ]')
  .test(() => {
    const a = [1,2];
    Taste.profile['formattedArray'] = Console.info(a).message;
  })
  .expect('formattedArray').toMatch('[ 1,2 ]');

Taste.flavor('Formatting objects in a log')
  .describe('Prints { foo: 1, bar: 2 }')
  .test(() => {
    const o = {foo: 1, bar: 2};
    Taste.profile['formattedObject'] = Console.info(o).message;
  })
  .expect('formattedObject').toMatch('{ foo: 1, bar: 2 }');

Taste.flavor('Formatting multiple arguments in a log')
  .describe('Prints 1 2 3 and a b c')
  .test(() => {
    const v1 = 1;
    const v2 = 2;
    const v3 = 3;
    const v4 = 'a';
    const v5 = 'b';
    const v6 = 'c';
    Taste.profile['formattedArgs'] = Console.info(v1, v2, v3, 'and', v4, v5, v6).message;
  })
  .expect('formattedArgs').toMatch('1 2 3 and a b c');
