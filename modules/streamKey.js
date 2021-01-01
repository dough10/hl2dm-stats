/**
 * @module modules/streamKey
 * @exports createUser
 */
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const dbURL = require('./loadConfig.js')().dbURL;

/**
 *  adds a user / stream name to the database
 * @param {String} name name of the stream 
 * @param {String} key authorization key
 * 
 * @returns {Void} nothing
 */
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
        dbo.collection("stream-keys").findOne({
          name: name
        }, (err, result) => {
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