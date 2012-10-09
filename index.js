var crypto = require('crypto');

var d = exports.defaults = {};

exports.verify = function(data, hash, opts) {
  if(typeof data !== 'string' || typeof hash !== 'string' ) {
    throw new Error('data should be a string '+(typeof data === 'string'));
    return false;
  }
  var epoch = Math.round(new Date().getTime() / 1000 / d.timeStep); // e.g. http://tools.ietf.org/html/rfc6238
  // allow data to be empty, always take into account the time
  var out = crypto.createHmac('sha512', d.secret).update(data + epoch).digest('base64'),
      old = crypto.createHmac('sha512', d.secret).update(data + (epoch - 1)).digest('base64');
  return (out === hash || old === hash);
};

exports.generate = function(data, opts) {
  if(typeof data !== 'string') {
    throw new Error('data should be a string '+(typeof data === 'string'));
    return false;
  }
  var now = opts && opts.now || (new Date().getTime()),
      ts = opts && opts.timeStep || d.timeStep,
      secret =  opts && opts.secret || d.secret,
      epoch = Math.round(now / 1000 / ts); // e.g. http://tools.ietf.org/html/rfc6238
  return crypto.createHmac('sha512', secret).update(data + epoch).digest('base64');
};
