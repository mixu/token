# token

## Time-limited, HMAC-based authentication token generation

Basic ideas:

- Tokens are time-limited
- Tokens can be associated with a set of data
- Token expiry is lax, e.g. clients are warned well in advance of token expiry that they should renew their token
- The verification hashes are cached

## API

- token.generate([data], [opts]): Given a piece of data, generates a sha512 HMAC from the data and the current time (step) using a secret key
- token.verify(data, hash): Given a piece of data and a token, verifies that the HMAC matches. Returns a truthy value, either token.VALID or EXPIRING if the token is valid, or a falsy value, token.INVALID if the token is expired or invalid.
- token.invalidate(data, hash): Given a piece of data, verifies the hash, and invalidates case is valid.

## Configuration

Token is just a small wrapper around sha512 HMAC hashes.

`token` has the following configuration options:

- .defaults.secret: A shared secret
- .defaults.timeStep: The length of the time a token is valid.
- .defaults.cache: If false, caching is disabled.

The server that generates the token, and the server that verifies the token have to agree on these two values. For example:

    var token = require('token');
    token.defaults.secret = 'AAB';
    token.defaults.timeStep = 24 * 60 * 60; // 24h in seconds

Note that tokens from the previous and next time step are accepted, e.g. tokens can be valid up to three time steps from when they were issued. This allows for 1) the token to expire lazily and 2) for the servers to disagree on time (e.g. even if the generating server is ahead, the token will be accepted).

Caching: only the verification code uses a simple cache. Hashes are looked up from memory, and only computed if they were not previously computed. Up to 500 hashes are stored and when the cache is full, it is emptied completely.

## Passing in data and verifying the token

The idea is that you can take any arbitrary data, and make it part of the token hash.

This allows you to make sure that the token is valid and that the data associated with the token is trustworthy.

For example, you might generate a token like this:

    JSON.stringify( { id: 1, role: 'admin', auth: token.generate('1|admin') });

Then, to verify that token, you need the id and role attributes as well as the actual token hash.

The token will only validate if the id and role match (and the token timestamp is up to date, which is implicitly included):

    function isValid(json) {
      return token.verify(json.id+'|'+json.role, json.auth);
    }

Note that if you put data in the token, you will need to recreate the data argument when you verify the token.

## Token expiry

Expiry is lax: tokens from the previous time step are accepted.

The reason for having lax expiry is that it makes clients simpler: assuming that the token expiry is sufficiently long, clients do not need to handle edge cases around when the token expires.

Instead, when the clients send tokens that are old (e.g. expired one time step ago), the tokens are still accepted but the client is warned that it should get a new token soon.

## Links

- HOTP (HMAC-Based One-Time Password Algorithm): [RFC 4226](http:tools.ietf.org/html/rfc4226)
- TOTP (Time-Based One-Time Password Algorithm): [RFC 6238](http:tools.ietf.org/html/rfc6238)

