const clear = require('clear');                           // clear screen
const figlet = require('figlet');                         // ascii art
const package = require('../package.json');
const colors = require('colors');

function init(logFolder, configPath) {
  clear();
  console.log(colors.magenta(figlet.textSync(package.name, {
    horizontalLayout: 'default'
  })));
  console.log(`Legend: ` + 'Local Time, '.yellow + ' Timers,'.cyan + ' Important,'.red + ' People / IP\'s,'.grey + ' Files / Paths,'.green + ' Weapons / Chat'.magenta);
  console.log(`Config = ${configPath.green}`);
  console.log(`Log folder = ${logFolder.green}`);
  console.log(`API Version: ` + `${package.version}`.red);
}

module.exports = init;
