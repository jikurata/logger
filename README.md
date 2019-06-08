# Logger v0.2.0
Expanded console logging and recording
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
```
// Logger is a Singleton, so the same object is referenced when it is called in other files

// Logger creates a Log object for every log
const log = Logger.log('foo');
console.log(log) // { type: 'info', timestamp: <Date>, message: 'foo' }

// Logger will emit the Log object through the 'log' event
Logger.on('log', (log) => {
    // do stuff
});
Logger.log('foo'); // does stuff

// Event emitting can be disabled through the emitLog property
Logger.emitLog = false;

// Logs are also stored in the Logger history array
console.log(Logger.history) // [Log, Log, Log...]

// By default, the history size limit is set to 50, but can be modified through the historyLimit property
Logger.historyLimit = 10; // Sets limit to the 10 most recent log entries
```
## Documentation
---
- **class** Logger<br>
    - **Properties**:<br>
        *id*: {Number} The id is the pid of the process that is referencing it<br>
        *history*: {Log[]} Retains the most recent entries from Logger<br>
        *historyLimit*: {Number} (Default: 50) The maximum entries to retain at any time<br>
        *printMessage*: {Boolean} (Default: true) Toggles writing to stdout<br>
        *showTimestamp*: {Boolean} (Default: true) Displays Timestamp when printing a message<br>
        *emitLog*: {Boolean} (Default: true) Emits a log event whenever an entry is created<br>
    - **Methods**:<br>
        {Log} *info(...args)*: Write a message to stdout with the info format<br>
        {Log} *log(...args)*: Alias for info<br>
        {Log} *warn(...args)*: Write a message to stderr with the warning format<br>
        {Log} *error(...args)*: Write a error message to stderr with the error format<br>
        {Void} *printLog(log {Log})*: Formats a Log object and prints to stdout<br>

- **object** Log<br>
    - **Properties**:<br>
        *type*: {String} Will be labeled as info, warn, or error<br>
        *timestamp*: {Date} The datetime when the log was created<br>
        *message*: {String} The content of the log<br>
## Version Log
---
### v0.2.0
- Add printLog method to write existing Log objects to stdout

### v0.1.0
- Removed log recording functionality
- Removed Timestamp object
- Added Log object
- Logger retains its log history
- Logger emits the 'log' event
- Refactored Logger properties into a state object
