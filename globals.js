global.Buffer = require('buffer').Buffer;

global.location = {
  protocol: 'file:',
};

global.process.version = 'v16.0.0';
if (!global.process.version) {
  global.process = require('process');
}

process.browser = true;
