/**
 * authorization module.
 * @module modules/auth
 * @requires bcrypt
 * @exports auth
 */

 /** hashing password / auth keys */
const bcrypt = require('bcrypt');

/**
 * @typedef Token
 * @property {bool} match False if the token is invalid.
 * @property {JSON} match - user info.
 */

/**
 * authorize
 * @async
 * @param {Object} db - mongodb connection object
 * @param {String} name - the name of the stream / user
 * @param {String} pass - the streams auth key / password
 * 
 * @returns {Promise<Token>} promise to a token
 * 
 * @example  <caption>Example usage of auth function.</caption>
 * // returns true | false;
 * auth(mongoDB-connection, 'registeredUser', 'supersecurepassword').then(authorized => {
 *   if (!authorized) return 'fail';
 *   return 'allowed';
 * })
 */
function auth(db, name, pass) {
  return new Promise((resolve, reject) => {
    if (!db) return reject('database connection required');
    if (!name) return reject('stream name required');
    if (!pass) return reject('password required');
    db.collection("stream-keys").findOne({
      name: name
    }, (err, result) => {
      if (err) {
        reject(err);
        return;
      } 
      bcrypt.compare(pass, result.key, (err, match) => {
        if (err) reject(err);
        resolve(match);
      });
    });
  });
}

module.exports = auth;
