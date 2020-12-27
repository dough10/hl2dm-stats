/**
 * stream authorization module.
 * @module modules/auth
 * @requires bcrypt
 */

 /** hashing password / auth keys */
const bcrypt = require('bcrypt');

/**
 * authorize stream
 * @async
 * @param {Object} db - mongodb connection object
 * @param {String} name - the name of the stream / user
 * @param {String} pass - the streams auth key / password
 * 
 * @returns {Promise<Object>} returns user object for True, error if failed
 */
function auth(db, name, pass) {
  return new Promise((resolve, reject) => {
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
