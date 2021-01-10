const MongoClient = require('mongodb').MongoClient; 
var config = require('./loadConfig.js')();

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