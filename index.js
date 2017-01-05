var crypto = require('crypto');

var d = exports.defaults = {
  cache: true
};

var items = {};

function cache(key) {
  if(!items[key] || !d.cache) {
    if(Object.keys(items).length > 500) {
      items = {};
    }
    items[key] = crypto.createHmac('sha512', d.secret).update(key).digest('base64');
  }
  return items[key];
}

exports.INVALID = 0;
exports.VALID = 1;
exports.EXPIRING = 2;

exports.verify = function(data, hash) {
  if(typeof data !== 'string' || typeof hash !== 'string' ) {
    return false;
  }
  var epoch = Math.floor(new Date().getTime() / 1000 / d.timeStep); // e.g. http://tools.ietf.org/html/rfc6238
  // allow data to be empty, always take into account the time
  if (hash === cache(data + epoch) || hash === cache(data + (epoch + 1))) {
    return exports.VALID; // truthy, valid and current
  }
  if (hash === cache(data + (epoch - 1))) {
    return exports.EXPIRING; // truthy, expired but still valid
  }
  return exports.INVALID;
};

exports.generate = function(data, opts) {
  if(typeof data !== 'string') {
    return false;
  }
  var now = opts && opts.now || (new Date().getTime()),
      ts = opts && opts.timeStep || d.timeStep,
      secret =  opts && opts.secret || d.secret,
      epoch = Math.floor(now / 1000 / ts); // e.g. http://tools.ietf.org/html/rfc6238
  return crypto.createHmac('sha512', secret).update(data + epoch).digest('base64');
};

exports.invalidate = function(data, hash) {
  var isValidHash = exports.verify(data, hash),
    epoch = Math.floor(new Date().getTime() / 1000 / d.timeStep);

  if (!isValidHash) {
    throw 'invalid hash';
  } else {
    items[hash + epoch] = null;
  }

  return true;
};
