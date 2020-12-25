/**
 * stream authorization module.
 * @module modules/auth
 */

const bcrypt = require('bcrypt');                         // hash and check passwords

/**
 * authorize stream upload
 *
 * @param {Object} db - mongodb object
 * @param {String} name - the name of the stream
 * @param {String} pass - the streams auth key
 * 
 * @returns {Boolean} returns true for authorized, false for failed
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
