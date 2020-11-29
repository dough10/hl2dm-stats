const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const args = process.argv.slice(2);
const name = args[0];
const key = args[1];
const dbURL = require('config.json').dbURL;

MongoClient.connect(url, (err, db) => {
  if (err) throw err;
  var dbo = db.db("hl2dm");
  bcrypt.hash(key, 10, (err, hash) => {
    if (err) {
      return new Error(err);
    }
    var myobj = { name: name, key: hash };
    dbo.collection("stream-keys").insertOne(myobj, (err, res) => {
      if (err) throw err;
      console.log(hash);
      db.close();
    });
  });
});
