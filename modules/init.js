const clear = require('clear');                           // clear screen
const figlet = require('figlet');                         // ascii art

function init() {
  clear();
  console.log(figlet.textSync('HL2DM-stats', {
    horizontalLayout: 'default'
  }));
  console.log(`${new Date().toLocaleString().yellow} - API Version: ` + `${require('../package.json').version}`.red);
}

module.exports = init;
