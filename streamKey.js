const bcrypt = require('bcrypt');
var args = process.argv.slice(2);
bcrypt.hash(args[0], 10, (err, hash) => {
  if (err) {
    return console.error(err);
  }
  console.log(hash);
});
