const MongoClient = require('mongodb').MongoClient;       // mongodb for streamkey storage
const config = require(`../config.json`);                 // config file location
const args = process.argv;

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
  var dbo = db.db("hl2dm");
  dbo.collection("players").find({
    date: Number(args[2]) || now.getDate(),
    year: now.getFullYear(),
    month: now.getMonth(),
    new: false
  }).toArray((err, res) => {
    if (err) throw err;
    db.close();
    if (!res.length) {
      console.log(`No players found for that day`)
    }
    res.forEach(player => {
      console.log(player)
    })
  });
});