const MongoClient = require('mongodb').MongoClient;       // mongodb for streamkey storage
const config = require(`../config.json`);                 // config file location


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
          insertPlayer(data).then(resolve).catch(reject);
          db.close();
        }
      }).catch(reject);
    });
  })
}

module.exports = logUser;