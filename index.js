var async = require('async');
var browse = require('./browse');

/**
 * This function launch an array of `tests` in every `browsers` connected to a selenium grid
 * described by `remoteCfg`
 * Each test gets `testCb` called with err, context (url, browser)
 * Each browser will launch opt.concurrency tests in parallel
*/
module.exports = function seleniumRunner (opt, tests, testCb, endCb) {
    filterBrowsers(opt.browsers, opt.remoteCfg, browsersFound);

    function browsersFound (err, browsers) {
        if (err !== null) {
            return endCb(err);
        }

        async.forEach(browsers, launchTestsForDesiredBrowser, endCb);
    }

    function launchTestsForDesiredBrowser (desired, cb) {
        var queue = async.queue(launchTest, opt.concurrency);

        tests.forEach(function(test) {
            var task = {
                url: test.url,
                desired: desired,
                remoteCfg: opt.remoteCfg,
                exec: test.exec
            };
            queue.push(task, testCb);
        });

        queue.drain = cb;
    }
}

function launchTest (opt, cb) {
    browse(opt.url, opt.desired, opt.remoteCfg, function(err, browser) {
        opt.exec(browser, function(err) {
            var context = {
                url: opt.url,
                browser: opt.desired
            };

            browser.quit(function() {
                cb(err, context);
            });
        });
    })
}

function filterBrowsers (browsers, remoteCfg, cb) {
    var grid = require('selenium-grid-status');

    grid.available(remoteCfg, function(err, availableBrowsers) {
        if (err !== null) {
            return cb(new Error('Could not connect to selenium grid, did you started it?'));
        }

        var foundBrowsers = browsers.filter(function(desired) {
            return availableBrowsers.some(function(available) {
                return available.browserName === desired.browserName &&
                    available.version === desired.version;
            });
        });

        if (foundBrowsers.length === 0) {
            return cb(new Error('No browsers found in the grid, did you started your VMs?'))
        }

        cb(null, foundBrowsers);
    });
}