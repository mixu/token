var assert = require('assert'),

    Auth = require('../index.js');

Auth.defaults.secret = 'AAB';
Auth.defaults.timeStep = 24 * 60 * 60; // 24h in seconds

exports['valid token should be accepted'] = function() {
  var hmac = Auth.generate('foo');
  assert.ok(Auth.verify('foo', hmac));
};

exports['invalid token should be rejected'] = function() {
  var hmac = Auth.generate('foo', { secret: 'abc' });
  assert.ok(!Auth.verify('foo', hmac));
};

exports['expired token should be rejected'] = function() {
  function ep(d) { return Math.round(d / 1000 / Auth.defaults.timeStep); }
  var epoch = ep(new Date().getTime()),
      old = (epoch - 1) * 1000 * Auth.defaults.timeStep,
      expired = (epoch - 2) * 1000 * Auth.defaults.timeStep;
  assert.ok(Auth.verify('foo', Auth.generate('foo', { now: old })));
  assert.ok(!Auth.verify('foo', Auth.generate('foo', { now: expired })));
};

// if this module is the script being run, then run the tests:
if (module == require.main) {
  var mocha = require('child_process').spawn('mocha', [ '--colors', '--ui', 'exports', '--reporter', 'spec', __filename ]);
  mocha.stdout.pipe(process.stdout);
  mocha.stderr.pipe(process.stderr);
}
