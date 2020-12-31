/**
 * @module modules/gameServerStatus
 * @requires Gamedig
 * @exports gameServerStatus
 * 
 */
const Gamedig = require('gamedig');                       // get data about game servers

/**
 * get GameDig data from game server
 * 
 * @returns {Object} gamedig server statsus object
 * 
 * @example <caption>Example usage of gameServerStatus module.</caption>
 * gameServerStatus().then(status => {
 *   // console.log(status) = gamedig status 
 * });
 */
module.exports = () =>  new Promise((resolve, reject) => {
  Gamedig.query({
    type: 'hl2dm',
    host: require('../loadConfig.js')().gameServerHostname
  }).then(resolve).catch(reject);
});
