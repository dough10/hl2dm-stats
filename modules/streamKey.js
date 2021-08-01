/**
 * @fileoverview command line account creation tool
 * @module modules/streamKey
 * @author Jimmy Doughten <https://github.com/dough10>
 * @requires bcrypt
 * @requires colors
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
const colors = require('colors');
var db;

function eHandler(e) {
  console.error(e.red);
  process.exit(0);
}

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
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
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
async function createUser(name, key) {
  if (!name) throw Error("stream name is required");
  if (!key) throw Error("stream key is required");
  try {
    db = await mongoConnect();
    try {
      let exists = await checkEntry(name);
      if (exists) {
        throw 'Entry Exists'.red;
      }
      bcrypt.hash(key, 10, (err, hash) => {
        if (err) throw err;
        db.collection("stream-keys").insertOne({ 
          name: name, 
          key: hash 
        }, async er => {
          if (er) eHandler(er);
          try {
            await checkEntry(name);
            console.log(`User ${name.yellow} with key ${key.magenta} saved to db`);
            process.exit(0);
          } catch(e) {
            eHandler(e);
          }
        });
      });
    } catch (e) {
      eHandler(e);
    }
  } catch (e) {
    eHandler(e);
  }
}

rl.question("stream name ? ", name => {
  rl.question("stream key ? ", key => {
    createUser(name, key);
    rl.close();
  });
});