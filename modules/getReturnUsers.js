const MongoClient = require('mongodb').MongoClient;       // mongodb for streamkey storage
const config = require(`../config.json`);                 // config file location
const Timer = require('./Timer.js');

function getReturnUsers(date) {
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
      var now = new Date();
      if (typeof date !== 'number') {
        date = Number(date);
      }
      if (date === 0) {
        date = undefined;
      }
      var dbo = db.db("hl2dm");
      dbo.collection("players").distinct("name", {
        date: date || now.getDate(),
        year: now.getFullYear(),
        month: now.getMonth(),
        new: false
      }, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        db.close();
        resolve(res);
      });
    });
  });
}

module.exports = getReturnUsers;
