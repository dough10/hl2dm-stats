const clear = require('clear');                           // clear screen
const figlet = require('figlet');                         // ascii art

function init() {
  clear();
  console.log(figlet.textSync('dough10/hl2dm-stats', {
    horizontalLayout: 'default'
  }));
}

module.exports = init;
