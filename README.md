# Logger
Expanded console logging and recording
---
## Install
```
npm install @jikurata/logger
```
## Usage
```
const Logger = require('@jikurata/logger');

// By default prints message with a timestamp
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
## Recording Logs
Set the log path using in an .env file
```
LOG_PATH=some/directory/file.log
```
Enabling log recording can also be done through .env:
```
RECORD_LOG=true
```
With these env variables, any log commands will be saved in the specified directory. If LOG_PATH is not defined, it will default to logger.log, which will write at the root of the project directory.
```
const Logger = require('@jikurata/logger');
Logger.log('foo') // foo in some/directory/file.log

// Alternatively, recording can be enabled by setting the recordLog property

Logger.recordLog = true;
Logger.log('bar') // bar in some/directory/file.log
```
