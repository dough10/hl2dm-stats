const MongoClient = require('mongodb').MongoClient;       // mongodb for streamkey storage
const print = require('./printer.js');
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


function logUser(data, ) {
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
            resolve(data);
            db.close();
          }).catch(reject);
          return;
        }
        resolve();
      }).catch(reject);
    });
  });
}

var cache = [];
function cacheData(data) {
  cache.push(data);
}

setInterval(_ => {
  if (cache.length) {
    logUser(cache[0]).then(user => {
      if (user) print(`${user.name.grey} connection at ${new Date(user.time).toLocaleString().yellow} was logged into database`);
    }).catch(console.error);
    cache.splice(0,1);
  }
}, 100);

module.exports = cacheData;