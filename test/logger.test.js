'use strict';
const Taste = require('@jikurata/taste');
const Logger = require('../src/Logger.js');
const Record = require('../src/Record.js');

const Console = new Logger();
Console.printMessage = false;

Taste('Emitting record event')
.test('Emits record event when a record is created', (profile) => {
  Console.on('record', (record) => {
    profile['recordEventEmitted'] = true;
    profile['record'] = record;
  });
  Console.createRecord('info','foobar');
  Console.unregisterEvent('record');
})
.expect('recordEventEmitted').toBeTruthy()
.expect('record').toBeInstanceOf(Record);

Taste('Logger retains is record history')
.test('Logger creates a Record object and stores it in its history', (profile) => {
  Console.history.length = 0;
  Console.log('testing log history');
  Console.info('testing log history');
  Console.warn('testing log history');
  Console.error('testing log history');
  profile['logHistoryLength'] = Console.history.length;
})
.expect('logHistoryLength').toEqual(4);
  

Taste('Logger history limit')
.test('Logger deletes the oldest entries if past limit', (profile) => {
  Console.historyLimit = 3;
  for ( let i = 6; --i; ) Console.info(i);
  profile['restrictedHistoryLength'] = Console.history.length;
})
.expect('restrictedHistoryLength').toEqual(3);

Taste('Identifying data types')
.test(profile => {
  class Foo {
    constructor() {
      this.value = 'bar';
    }
  }
  profile.isNull = Console.getDataType(null);
  profile.isUndefined = Console.getDataType(undefined);
  profile.isBoolean = Console.getDataType(true);
  profile.isString = Console.getDataType('foobar');
  profile.isNumber = Console.getDataType(1);
  profile.isBigInt = Console.getDataType(1n);
  profile.isFunction = Console.getDataType(() => {});
  profile.isSymbol = Console.getDataType(Symbol('foo'));
  profile.isObject1 = Console.getDataType({1: 'foo', 2: 'bar'});
  profile.isObject2 = Console.getDataType([1,2,3]);
  profile.isObject3 = Console.getDataType(new Foo());
})
.expect('isNull').toEqual('null')
.expect('isUndefined').toEqual('undefined')
.expect('isBoolean').toEqual('boolean')
.expect('isString').toEqual('string')
.expect('isNumber').toEqual('number')
.expect('isBigInt').toEqual('bigint')
.expect('isFunction').toEqual('function')
.expect('isSymbol').toEqual('symbol')
.expect('isObject1').toEqual('object')
.expect('isObject2').toEqual('object')
.expect('isObject3').toEqual('object');

Taste('Formatting falsy inputs')
.test(profile => {
  profile.test1 = Console.removeANSIColors(Console.log(0).colored);
  profile.test2 = Console.removeANSIColors(Console.log(-1).colored);
  profile.test3 = Console.removeANSIColors(Console.log(null).colored);
  profile.test4 = Console.removeANSIColors(Console.log(undefined).colored);
  profile.test5 = Console.removeANSIColors(Console.log(false).colored);
})
.expect('test1').toEqual('0')
.expect('test2').toEqual('-1')
.expect('test3').toEqual('null')
.expect('test4').toEqual('undefined')
.expect('test5').toEqual('false');

Taste('Formatting string inputs')
.test(profile => {
  profile.test1 = Console.removeANSIColors(Console.log('foo', 'bar').colored);
  profile.test2 = Console.removeANSIColors(Console.log('foo\nbar').colored);
  profile.test3 = Console.removeANSIColors(Console.log('').colored);
  profile.test4 = Console.removeANSIColors(Console.log('', '').colored);
  profile.test5 = Console.removeANSIColors(Console.log(' ').colored);
  profile.test6 = Console.removeANSIColors(Console.log('  ').colored);
  profile.test7 = Console.removeANSIColors(Console.log('foo' + 'bar').colored);
  profile.test8 = Console.removeANSIColors(Console.log(typeof 42).colored);
})
.expect('test1').toEqual('foo bar')
.expect('test2').toEqual('foo\nbar')
.expect('test3').toEqual('')
.expect('test4').toEqual(' ')
.expect('test6').toEqual('  ')
.expect('test7').toEqual('foobar')
.expect('test8').toEqual('number');

Taste('Formatting number inputs')
.test(profile => {
  profile.test1 = Console.removeANSIColors(Console.log(0).colored);
  profile.test2 = Console.removeANSIColors(Console.log(1).colored);
  profile.test3 = Console.removeANSIColors(Console.log(1, 2, 3).colored);
  profile.test4 = Console.removeANSIColors(Console.log(-1).colored);
  profile.test5 = Console.removeANSIColors(Console.log(40 + 2).colored);
  profile.test6 = Console.removeANSIColors(Console.log(0n).colored);
  profile.test7 = Console.removeANSIColors(Console.log(1n).colored);
})
.expect('test1').toEqual('0')
.expect('test2').toEqual('1')
.expect('test3').toEqual('1 2 3')
.expect('test4').toEqual('-1')
.expect('test5').toEqual('42')
.expect('test6').toEqual('0n')
.expect('test7').toEqual('1n');

Taste('Formatting boolean inputs')
.test(profile => {
  profile.test1 = Console.removeANSIColors(Console.log(true).colored);
  profile.test2 = Console.removeANSIColors(Console.log(3 === 3).colored);
  profile.test3 = Console.removeANSIColors(Console.log(!true).colored);
  profile.test4 = Console.removeANSIColors(Console.log(true, false).colored);
})
.expect('test1').toEqual('true')
.expect('test2').toEqual('true')
.expect('test3').toEqual('false')
.expect('test4').toEqual('true false');

Taste('Formatting array inputs')
.test(profile => {
  profile.test1 = Console.removeANSIColors(Console.log([1, 2, 3]).colored);
  profile.test2 = Console.removeANSIColors(Console.log([1, 'foo']).colored);
  profile.test3 = Console.removeANSIColors(Console.log([['a', 'b'], [1,2]]).colored);
})
.expect('test1').toEqual('[ 1, 2, 3 ]')
.expect('test2').toEqual('[ 1, \'foo\' ]')
.expect('test3').toEqual('[ [ \'a\', \'b\' ], [ 1, 2 ] ]');

Taste('Formatting symbol inputs')
.test(profile => {
  profile.test1 = Console.removeANSIColors(Console.log(Symbol(null)).colored);
  profile.test2 = Console.removeANSIColors(Console.log(Symbol(undefined)).colored);
  profile.test3 = Console.removeANSIColors(Console.log(Symbol('')).colored);
  profile.test4 = Console.removeANSIColors(Console.log(Symbol('foo')).colored);
  profile.test5 = Console.removeANSIColors(Console.log(Symbol(1)).colored);
})
.expect('test1').toEqual('Symbol(null)')
.expect('test2').toEqual('Symbol()')
.expect('test3').toEqual('Symbol()')
.expect('test4').toEqual('Symbol(foo)')
.expect('test5').toEqual('Symbol(1)');

Taste('Formatting object inputs')
.test(profile => {
  class Foo {
    constructor() {
      this.a = 1;
      this.b = '2';
    }
  }
  class Bar extends Foo {
    constructor() {
      super();
      this.c = true;
      this.d = null;
    }
  }

  profile.test1 = Console.removeANSIColors(Console.log({}).colored);
  profile.test2 = Console.removeANSIColors(Console.log({1: 'foo', a: 'bar'}).colored);
  profile.test3 = Console.removeANSIColors(Console.log({a: [1,2], b: null}).colored);
  profile.test4 = Console.removeANSIColors(Console.log(Foo).colored);
  profile.test5 = Console.removeANSIColors(Console.log(Bar).colored);
  profile.test6 = Console.removeANSIColors(Console.log(new Foo()).colored);
  profile.test7 = Console.removeANSIColors(Console.log(new Bar()).colored);
})
.expect('test1').toEqual('{ }')
.expect('test2').toEqual('{ 1: \'foo\', a: \'bar\' }')
.expect('test3').toEqual('{ a: [ 1, 2 ], b: null }')
.expect('test4').toEqual('[class Foo]')
.expect('test5').toEqual('[class Bar extends Foo]')
.expect('test6').toEqual('Foo { a: 1, b: \'2\' }')
.expect('test7').toEqual('Bar { a: 1, b: \'2\', c: true, d: null }');

Taste('Formatting function inputs')
.test(profile => {
  function foo() {}
  const bar = () => {}
  profile.test1 = Console.removeANSIColors(Console.log(foo).colored);
  profile.test2 = Console.removeANSIColors(Console.log(bar).colored);
  profile.test3 = Console.removeANSIColors(Console.log(function() {}).colored);
  profile.test4 = Console.removeANSIColors(Console.log(() => { return 'test'; }).colored);
})
.expect('test1').toEqual('[Function: foo]')
.expect('test2').toEqual('[Function: bar]')
.expect('test3').toEqual('[Function (anonymous)]')
.expect('test4').toEqual('[Function (anonymous)]');

Taste('Formatting circular references')
.test(profile => {
  class A {
    constructor() {
      this.a = 1;
      this.obj = new B(this);
    }
  }
  class B {
    constructor(ref) {
      this.b = 1;
      this.ref = ref;
    }
  }
  const arrayC = [1, 2, 3];
  const arrayD = ['a', 'b', arrayC];
  arrayC.push(arrayD);
  profile.test1 = Console.removeANSIColors(Console.log(new A()).colored);
  profile.test2 = Console.removeANSIColors(Console.log(arrayD).colored);
})
.expect('test1').toEqual('A { a: 1, obj: B { b: 1, ref: [Circular A] } }')
.expect('test2').toEqual('[ \'a\', \'b\', [ 1, 2, 3, [Circular Array] ] ]');

Taste('Formatting arrays in a log')
.test('Prints [ 1,2 ]',(profile) => {
  const a = [1,2];
  profile['formattedArray'] = Console.info(a).message;
})
.expect('formattedArray').toMatch('[ 1, 2 ]');

Taste('Formatting objects in a log')
.test('Prints { foo: 1, bar: 2 }', (profile) => {
  const o = {foo: 1, bar: 2};
  profile['formattedObject'] = Console.info(o).message;
})
.expect('formattedObject').toMatch('{ foo: 1, bar: 2 }');

Taste('Formatting multiple arguments in a log')
.test('Prints 1 2 3 and a b c', (profile) => {
  const v1 = 1;
  const v2 = 2;
  const v3 = 3;
  const v4 = 'a';
  const v5 = 'b';
  const v6 = 'c';
  profile['formattedArgs'] = Console.info(v1, v2, v3, 'and', v4, v5, v6).message;
})
.expect('formattedArgs').toMatch('1 2 3 and a b c');
