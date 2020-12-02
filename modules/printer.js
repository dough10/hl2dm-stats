
/**
 * print strings to log with cuttent time
 */
function print(message) {
  var now = new Date().toLocaleString();
  console.log(`${now.yellow} - ${message}`);
}

module.exports = print;
