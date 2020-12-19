const Gamedig = require('gamedig');                       // get data about game servers
const config = require('./loadConfig.js')();

/**
 * get GameDig data from game server
 */
module.exports = () => new Promise((resolve, reject) => {
  Gamedig.query({
    type: 'hl2dm',
    host: config.gameServerHostname
  }).then(resolve).catch(reject);
})
