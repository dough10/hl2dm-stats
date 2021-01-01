const fs = require('fs'); 

module.exports = () => {
  if (process.platform === "win32" && fs.existsSync(`./configs/config-win.json`)) {
    return require(`../configs/config-win.json`);  
  }
  return require(`../configs/config.json`);
};