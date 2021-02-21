/**
 * @fileoverview command line account creation tool
 * @module modules/streamKey
 * @author Jimmy Doughten <https://github.com/dough10>
 * @requires bcrypt
 * 
 * @example <caption>Example usage of streamKey file.</caption>
 * node modules/streamKey.js
 */
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const mongoConnect = require('./mongo-connect/mongo-connect.js');
const bcrypt = require('bcrypt');
var db;


/**
 * checks if a entry exists
 * @param {String} name 
 * 
 * @returns {Promise} 
 */
function checkEntry(name) {
  return new Promise((resolve, reject) => {
    db.collection("stream-keys").findOne({
      name: name
    }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

function insertEntry(name, key) {
  return new Promise((resolve, reject) => {
    db.collection("stream-keys").insertOne({ 
      name: name, 
      key: hash 
    }, (err, res) => {
      if (err) return reject(err);
    });
  });
}


/**
 *  adds a user & password to the database
 * @param {String} name username / stream name 
 * @param {String} key authorization key / password
 * 
 * @returns {Void} nothing
 */
function createUser(name, key) {
  if (!name) throw Error("stream name is required");
  if (!key) throw Error("stream key is required");
  mongoConnect().then(connection => {
    db = connection;
    checkEntry(name).then(_ => {
      bcrypt.hash(key, 10, (err, hash) => {
        if (err) throw err;
        db.collection("stream-keys").insertOne({ 
          name: name, 
          key: hash 
        }, (err, res) => {
          if (err) throw err;
          checkEntry(name).then(_ => {
            console.log(`${name}: ${hash} saved to db`);
            process.exit(0);
          }).catch(e => {
            throw e;
          });
        });
      });
    }).catch(e => {
      throw e;
    });
  });
}

rl.question("stream name ? ", name => {
  rl.question("stream key ? ", key => {
    createUser(name, key);
    rl.close();
  });
});