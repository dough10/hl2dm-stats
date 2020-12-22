// const fs = require('fs');
// const mc = new console.Console(fs.createWriteStream('./hoedown.log'));

// /**
//  * print strings to log with cuttent time
//  */
// function _print(message) {
//   mc.log(`${new Date().toLocaleString().yellow} - ${message}`);
// }


/**
 * print strings to log with cuttent time
 */
function print(message) {
  var now = new Date().toLocaleString();
  console.log(`${now.yellow} - ${message}`);
}

module.exports = print;
