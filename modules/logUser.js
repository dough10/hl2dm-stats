const MongoClient = require('mongodb').MongoClient;       // mongodb for streamkey storage
const config = require(`../config.json`);                 // config file location

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
        reject(err);
        return;
      } 
      var dbo = db.db("hl2dm");
      dbo.collection("players").insertOne(data, err => {
        if (err) reject(err);
        dbo.collection("players").findOne({
          id: data.id
        }, err => {
          db.close();
          if (err) reject(err);
          resolve('connection saved');
        });
      });
    });
  })
}

module.exports = logUser;