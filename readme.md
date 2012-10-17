# token

## Time-limited, HMAC-based authentication token generation

Basic ideas:

- Tokens are time-limited
- Tokens can be associated with a set of data
- Token expiry is lax, e.g. clients are warned well in advance of token expiry that they should renew their token

## API

- token.generate([data], [opts]): Given a piece of data, generates a sha512 HMAC from the data and the current time (step) using a secret key
- token.verify(data, hash, [opts]): Given a piece of data and a token, verifies that the HMAC matches.

## Configuration

Token is just a small wrapper around sha512 HMAC hashes.

`token` has the following configuration options:

- .defaults.secret: A shared secret
- .defaults.timeStep: The length of the time a token is valid.

The server that generates the token, and the server that verifies the token have to agree on these two values. For example:

    var token = require('token');
    token.defaults.secret = 'AAB';
    token.defaults.timeStep = 24 * 60 * 60; // 24h in seconds

Note that tokens from the previous time step are accepted, e.g. tokens can be valid up to two time steps from when they were issued.

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


