const MongoClient = require('mongodb').MongoClient;       // mongodb for streamkey storage
const print = require('./printer.js');
var config = require('./loadConfig.js')();                   // config file location

MongoClient.connect(config.dbURL, {
  useUnifiedTopology: true,
  useNewUrlParser: true
}, (err, db) => {
  if (err) {
    throw new Error(err);
  }
  if (!db) {
    throw new Error('No database connection');
  }
  print('MongoDB connected.')
  connection = db.db("hl2dm");
});

var connection;

process.on('SIGTERM', _ => {
  connection.close();
});

function entryExists(data) {
  return new Promise((resolve, reject) => {
    connection.collection("players").findOne({
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
    connection.collection("players").insertOne(data, err => {
      if (err) {
        reject(err);
        return;
      } 
      connection.collection("players").findOne({
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
    entryExists(data).then(exists => {
      if (!exists) {
        insertPlayer(data).then(resolve).catch(reject);
        return;
      }
      resolve();
    }).catch(reject);
  });
}

module.exports = logUser;