const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const args = process.argv.slice(2);
const name = args[0];
const key = args[1];
const dbURL = require(`${__dirname}/config.json`).dbURL;

if (!name) throw Error("name required");
if (!key) throw Error("key required");

MongoClient.connect(dbURL, {
  useUnifiedTopology: true,
  useNewUrlParser: true
}, (err, db) => {
  if (err) throw err;
  var dbo = db.db("hl2dm");
  bcrypt.hash(key, 10, (err, hash) => {
    if (err) throw err;
    var myobj = { name: name, key: hash };
    dbo.collection("stream-keys").insertOne(myobj, (err, res) => {
      if (err) throw err;
      console.log(res);
      dbo.collection("stream-keys").findOne({name: name}, (err, result) => {
        if (err) throw err;
        console.log(result.key);
        db.close();
      });
    });
  });
});
