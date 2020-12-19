const MongoClient = require('mongodb').MongoClient;       // mongodb for streamkey storage
var config = require('./loadConfig.js')();                   // config file location


var dbo;

function entryExists(data) {
  return new Promise((resolve, reject) => {
    dbo.collection("players").findOne({
      time: data.time
    }, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  })
}

function insertPlayer(data) {
  return new Promise((resolve, reject) => {
    dbo.collection("players").insertOne(data, err => {
      if (err) {
        reject(err);
        return;
      } 
      dbo.collection("players").findOne({
        time: data.time
      }, (err, res) => {
        if (err) {
          reject(err);
          return;
        } 
        resolve('connection saved');
      });
    });
  })
}


function logUser(data) {
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
        reject('no db');
        return;
      } 
      dbo = db.db("hl2dm");
      entryExists(data).then(exists => {
        if (!exists) {
          insertPlayer(data).then(_ => {
            resolve();
            db.close();
          }).catch(reject);
        }
      }).catch(reject);
    });
  })
}

module.exports = logUser;