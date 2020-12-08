const MongoClient = require('mongodb').MongoClient;       // mongodb for streamkey storage
const config = require(`../config.json`);                 // config file location
const args = process.argv;
const Timer = require('../modules/Timer.js');

var now = new Date();

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
  var t = new Timer();
  var dbo = db.db("hl2dm");
  dbo.collection("players").find({
    date: Number(args[2]) || now.getDate(),
    year: now.getFullYear(),
    month: now.getMonth(),
    new: true
  }).toArray((err, res) => {
    if (err) throw err;
    db.close();
    res.forEach(player => {
      console.log(player.name)
    });
    console.log(`${res.length} new players ${t.endString()} time to complete request`);
  });
});