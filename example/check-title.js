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