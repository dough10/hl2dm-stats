const MongoClient = require('mongodb').MongoClient;       // mongodb for streamkey storage
const config = require(`../config.json`);                 // config file location
const bcrypt = require('bcrypt');                         // hash and check passwords

/**
 * authorize stream upload
 *
 * @param {String} name - the name of the stream
 * @param {String} pass - the streams auth key
 */
function auth(name, pass) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(config.dbURL, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    }, (err, db) => {
      if (err) reject(err);
      var dbo = db.db("hl2dm");
      dbo.collection("stream-keys").findOne({
        name: name
      }, (err, result) => {
        db.close();
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
  });
}

module.exports = auth;
