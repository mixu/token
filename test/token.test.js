var assert = require('assert'),

    Auth = require('../index.js');

Auth.defaults.secret = 'AAB';
Auth.defaults.timeStep = 24 * 60 * 60; // 24h in seconds

exports['valid token should be accepted'] = function() {
  var hmac = Auth.generate('foo');
  assert.equal(Auth.verify('foo', hmac), Auth.VALID);
};

exports['invalid token should be rejected'] = function() {
  var hmac = Auth.generate('foo', { secret: 'abc' });
  assert.equal(Auth.verify('foo', hmac), Auth.INVALID);
};

exports['expired token should be rejected'] = function() {
  function ep(d) { return Math.round(d / 1000 / Auth.defaults.timeStep); }
  var epoch = ep(new Date().getTime()),
      old = (epoch - 1) * 1000 * Auth.defaults.timeStep - 1,
      expired = (epoch - 2) * 1000 * Auth.defaults.timeStep - 1;
  assert.equal(Auth.verify('foo', Auth.generate('foo', { now: old })), Auth.EXPIRING);
  assert.equal(Auth.verify('foo', Auth.generate('foo', { now: expired })), Auth.INVALID);
};

exports['next expiry'] = function() {

  var epoch = Math.floor(new Date().getTime() / 1000 / Auth.defaults.timeStep),
      started = new Date(epoch * Auth.defaults.timeStep * 1000),
      ends = new Date( (epoch + 1) * Auth.defaults.timeStep * 1000),
      untilEnd = ends.getTime() - new Date().getTime();

  var seconds = Math.floor(untilEnd / 1000),
      minutes = Math.floor(seconds / 60),
      hours = Math.floor(minutes / 60),
      days = Math.floor(hours / 24);

  seconds -= minutes * 60;
  minutes -= hours * 60;
  hours -= days * 24;

  console.log('Now: ' + new Date());
  console.log('Started: ' + started);
  console.log('Ends: ' + ends);
  console.log(days + ' days ' + hours + 'h ' +minutes + 'm ' + seconds + 's');
};

exports['bench'] = function() {
  this.timeout(5000);
  var until = new Date().getTime() + 2000,
      uncached = 0,
      cached = 0,
      token = Auth.generate('foo');

  Auth.defaults.cache = false;
  while(new Date().getTime() < until) {
    Auth.verify( 'foo', token );
    uncached++;
  }
  console.log('Uncached: ', uncached / 2  + ' hashes per second');

  Auth.defaults.cache = true;
  until = new Date().getTime() + 2000;
  while(new Date().getTime() < until) {
    Auth.verify( 'foo', token );
    cached++;
  }
  console.log('Cached: ', cached / 2  + ' hashes per second');
};

// if this module is the script being run, then run the tests:
if (module == require.main) {
  var mocha = require('child_process').spawn('mocha', [ '--colors', '--ui', 'exports', '--reporter', 'spec', __filename ]);
  mocha.stdout.pipe(process.stdout);
  mocha.stderr.pipe(process.stderr);
}
