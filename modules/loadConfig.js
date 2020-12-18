module.exports = () => {
  if (process.platform === "win32") {
    return require(`../configs/config-win.json`);  
  }
  return require(`../configs/config.json`);
}