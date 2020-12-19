const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const dbURL = require('./modules/loadConfig.js')().dbURL;


function createUser(name, key) {
  if (!name) throw Error("stream name is required");
  if (!key) throw Error("stream key is required");
  MongoClient.connect(dbURL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  }, (err, db) => {
    if (err) throw err;
    var dbo = db.db("hl2dm");
    bcrypt.hash(key, 10, (err, hash) => {
      if (err) throw err;
      dbo.collection("stream-keys").insertOne({ 
        name: name, 
        key: hash 
      }, (err, res) => {
        if (err) throw err;
        // console.log(res);
        dbo.collection("stream-keys").findOne({name: name}, (err, result) => {
          db.close();
          if (err) throw err;
          console.log(result.key);
          console.log("Streamkey saved");
          process.exit(0);
        });
      });
    });
  });
}

rl.question("stream name ? ", name => {
  rl.question("stream key ? ", key => {
    createUser(name, key);
    rl.close();
  });
});