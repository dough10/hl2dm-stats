const Gamedig = require('gamedig');                       // get data about game servers

/**
 * get GameDig data from game server
 */
module.exports = () => new Promise((resolve, reject) => {
  Gamedig.query({
    type: 'hl2dm',
    host: require('./loadConfig.js')().gameServerHostname
  }).then(resolve).catch(reject);
})
