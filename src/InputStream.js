'use strict';
const Readable = require('stream').Readable;


class InputStream extends Readable {
  constructor() {
    super({
      objectMode: true
    });
  }

  _read(size) {}
}

module.exports = InputStream;
