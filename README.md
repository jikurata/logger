# Logger v1.0.0
Expanded console logging
---
## Install
```
npm install @jikurata/logger
```
## Basic Usage
```
const Logger = require('@jikurata/logger');

// Prints message with a timestamp
Logger.log('foo'); // [<Timestamp>] foo

// Timestamp can be disabled
Logger.showTimestamp = false;
Logger.log('foo') // foo

// Disable logging
Logger.printMessage = false;
Logger.log('foo'); // Print's nothing

// Pass multiple arguments to be appended together
const a = 'foo';
const b = 'bar';
Logger.log(a, 'and', b); // foo and bar

// Prints errors with its stack
const err = new Error('some error');
Logger.error(err); // Error: some error <Stack trace>
```
## Advanced Usage
Logger is a Singleton, so the same object is referenced when it is called in other files.
```
// Logger creates a Record object each time it is invoked
const record = Logger.log('foo');
console.log(record) // { type: 'info', timestamp: <Date>, message: 'foo' }

// Logger will emit the Record object through the 'record' event after it is invoked
Logger.on('record', (record) => {
    // do stuff
});

// Event emitting can be disabled through the emitLog property
Logger.emitLog = false;

// Records are also stored in the Logger history array
console.log(Logger.history) // [Record, Record, Record...]

// By default, the history size limit is set to 50, but can be modified through the historyLimit property
Logger.historyLimit = 10; // Sets limit to the 10 most recent log entries
```
## Documentation
---
- **class** Logger<br>
    - **Properties**:<br>
        *history*: {Array[Record]} Retains the most recent entries from Logger<br>
        *historyLimit*: {Number} (Default: 50) The maximum entries to retain at any time<br>
        *useColors*: {Boolean} (Default: true) Toggles writing to stdout<br>
        *printMessage*: {Boolean} (Default: true) Toggles writing to stdout<br>
        *showTimestamp*: {Boolean} (Default: true) Displays Timestamp when printing a message<br>
        *showTimezone*: {Boolean} (Default: false) Displays Timezone when printing a message<br>
        *emitRecord*: {Boolean} (Default: true) Emits a record event whenever an entry is created<br>
    - **Methods**:<br>
        *info(...args)*: Write a message to stdout with the info format<br>
        *log(...args)*: Alias for info<br>
        *warn(...args)*: Write a message to stderr with the warning format<br>
        *error(...args)*: Write a error message to stderr with the error format<br>

- **object** Record<br>
    - **Properties**:<br>
        *type*: {String} Will be labeled as info, warn, or error<br>
        *timestamp*: {Date} The datetime when the record was created<br>
        *message*: {String} The content of the record<br>
        *colored*: {String} The message with 8-bit ANSI color codes embedded<br>
## Version Log
---
### v1.0.0
- Refactor print methods to act as wrappers for original console methods
- Implemented colored printing mode. Display data types with prefined color sets
- Uses 8-bit ANSI color codes

### v0.2.1
- Refactored Jest tests to Taste tests

### v0.2.0
- Add printLog method to write existing Log objects to stdout

### v0.1.0
- Removed log recording functionality
- Removed Timestamp object
- Added Log object
- Logger retains its log history
- Logger emits the 'log' event
- Refactored Logger properties into a state object
