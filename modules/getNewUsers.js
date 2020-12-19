const MongoClient = require('mongodb').MongoClient;       // mongodb for streamkey storage
var config = require('./loadConfig.js')();                   // config file location

/**
 * returns a list of  new users from the date givin
 * 
 * @param {Number} date - the date of this month to get user list for
 */
function getNewUsers(date) {
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
      dbo.collection("players").find({
        date: date || now.getDate(),
        year: now.getFullYear(),
        month: now.getMonth(),
        new: true
      }).toArray((err, res) => {
        if (err) {
          reject(err);
          return;
        }
        var arr = [];
        for (var i = 0; i < res.length; i++) {
          arr.push(res[i].name);
        }
        db.close();
        resolve(arr);
      });
    }); 
  });
}

module.exports = getNewUsers;