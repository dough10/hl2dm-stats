const clear = require('clear');                           // clear screen
const figlet = require('figlet');                         // ascii art
const package = require('../package.json');
const colors = require('colors');

function init(logFolder) {
  clear();
  console.log(colors.magenta(figlet.textSync(package.name, {
    horizontalLayout: 'default'
  })));
  console.log(`Legend: ` + 'Local Time, '.yellow + ' Timers,'.cyan + ' Important,'.red + ' People / IP\'s,'.grey + ' Files / Paths,'.green + ' Weapons / Chat'.magenta);
  console.log(`API Version: ` + `${package.version}`.red);
  console.log(`Log folder = ${logFolder.green}`);
}

module.exports = init;
