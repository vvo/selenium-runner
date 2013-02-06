selenium-runner
===============

Run a [{url+JSTest}, ..] combo in selenium grid, in parallel, in multiple browsers.

Basically, this module will launch a set of tests, in the browsers you want.
A test is defined by a URL to visit and a JavaScript callback to execute when the page
is ready.

```bash
npm install
node example
```

## Writing tests

We want to check the `<title>` of http://www.google.com in multiple browsers.
We will run the same test on http://www.yahoo.com and it will fail because the title
is different.

### Test file

Write your test file, it's a callback that will get a ready [browser object](https://github.com/admc/wd/).

check-title.js
```js
module.exports = function checkTitle(browser, cb) {
  browser.title(function(err, title) {
    if (err !== null) cb(err);

    if (title === 'Google') {
      cb(null);
    } else {
      cb(new Error('UH OH Title is not ok! Are you on google.com?'));
    }
  });
}
```
### Some configuration

* remoteCfg: Where is the [selenium grid](http://code.google.com/p/selenium/wiki/Grid2), you can
also use [saucelabs](https://saucelabs.com/)
* browsers: On which browsers to launch every test
* concurrency: How many tests a browser can launch in parallel

config.json
```json
{
  "remoteCfg": {
    "host": "127.0.0.1",
    "port": 4444
  },
  "browsers": [{
    "browserName": "internet explorer",
    "version": "9"
  }, {
    "browserName": "chrome",
    "version": "latest"
  }],
  "concurrency": 2
}
```

### Run them all!

launcher.js
```js
var seleniumRunner = require('selenium-runner');

// tests to run
var tests = [{
  url: 'http://www.google.com',
  exec: require('./check-title.js')
}, {
  url: 'http://www.yahoo.com',
  exec: require('./check-title.js')
}];

var config = require('./config.json');

// launch tests
seleniumRunner(config, tests, testCallback, endCallback);

// For each browser, you get the result of calling your test (check-title) here
// You always get the context: {url: 'http://', browser: {browserName: '', version: }}
function testCallback(err, context) {
  console.log('A test finished', arguments);
}

// Called when all tests have finished/or an error popped while connecting to the grid
// It will not get called when an error is emitted from a test
function endCallback(err) {
  console.log('All tests ended', arguments);
}
```

### Results

```bash
-> % node example
You should get 4 test callbacks and one end callback
A test finished { '0': null,
  '1':
   { url: 'http://www.google.com',
     browser: { browserName: 'internet explorer', version: '9' } } }
A test finished { '0': null,
  '1':
   { url: 'http://www.google.com',
     browser: { browserName: 'chrome', version: 'latest' } } }
A test finished { '0': [Error: UH OH Title is not ok! Are you on google.com?],
  '1':
   { url: 'http://www.yahoo.com',
     browser: { browserName: 'chrome', version: 'latest' } } }
A test finished { '0': [Error: UH OH Title is not ok! Are you on google.com?],
  '1':
   { url: 'http://www.yahoo.com',
     browser: { browserName: 'internet explorer', version: '9' } } }
All tests ended { '0': null }
```