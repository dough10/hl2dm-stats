const clear = require('clear');                           // clear screen
const figlet = require('figlet');                         // ascii art
const package = require('../package.json');

function init() {
  clear();
  console.log(figlet.textSync(package.name, {
    horizontalLayout: 'default'
  }));
  console.log(`${new Date().toLocaleString().yellow} - API Version: ` + `${package.version}`.red);
}

module.exports = init;
