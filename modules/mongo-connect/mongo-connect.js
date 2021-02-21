/**
 * @fileoverview establish a connection to mongodb 
 * @author Jimmy Doughten <https://github.com/dough10>
 * @requires mongodb
 * @requires loadConfig.js
 * 
 * @exports connectMongo
 * 
 * @example <caption>Example usage of mongo-connect module.</caption>
 * const mongoConnect = require('modules/mongo-connect/mongo-connect.js');
 * mongoConnect().then(database => {
 *   getNewUsers(database, 13).then(console.log); // = new users on the 13th
 * });
 */

const MongoClient = require('mongodb').MongoClient; 
var config = require('../loadConfig/loadConfig.js')();

function connectMongo() {
  return new Promise((resolve, reject) => {
    MongoClient.connect(config.dbURL, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    }, (err, db) => {
      if (err) {
        reject(err);
        return;
      }
      if (!db) {
        reject('No database connection');
        return;
      }
      resolve(db.db("hl2dm"));
    });
  });
}

module.exports = connectMongo;