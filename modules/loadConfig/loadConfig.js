/**
 * checks the OS version and loads the correct config file.
 * @module modules/loadConfig
 * @author Jimmy Doughten <https://github.com/dough10>
 * @requires fs
 * @exports configuration
 * @example <caption>Example usage of loadConfig module.</caption>
 * const config = require('modules/loadConfig.js');
 */

const fs = require('fs'); 

module.exports = () => {
  if (process.platform === "win32" && fs.existsSync(`./configs/config-win.json`)) {
    return require(`../../configs/config-win.json`);  
  }
  return require(`../../configs/config.json`);
};