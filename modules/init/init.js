/**
 * console log header
 * @module modules/init
 * @author Jimmy Doughten <https://github.com/dough10>
 * @requires clear
 * @requires figlet
 * @requires colors
 * @exports configuration
 * @example <caption>Example usage of init module.</caption>
 * init();
 */

const clear = require('clear');                           // clear screen
const figlet = require('figlet');                         // ascii art
const colors = require('colors');
const pack = require('../../package.json');

function init(logFolder) {
  clear();
  console.log(colors.magenta(figlet.textSync(pack.name, {
    horizontalLayout: 'default'
  })));
  console.log(`Legend: ` + 'Local Time, '.yellow + ' Timers,'.cyan + ' Important,'.red + ' People / IP\'s,'.grey + ' Files / Paths,'.green + ' Weapons / Chat'.magenta);
  console.log(`API Version: ` + `${pack.version}`.red);
  console.log(`Log folder = ${logFolder.green}`);
}

module.exports = init;
