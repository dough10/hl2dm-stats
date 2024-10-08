var influx = require('./influx-middle');
var RCON = require('srcds-rcon');
/**
 * push RCON stats to influx
 * @class
 */
class RconStats {
  /**
   * run RCON stats and log response in influxdb to be graphed in grafana
   * @constructor
   * 
   * @param {String} address 
   * @param {String} password
   * @param {Function} onStats
   * 
   * @example <caption>Example usage of RconStats Class.</caption>
   * new RconStats('127.0.0.1', 'suspersecurepassword', stats => {
   * // stats object that was logged to database
   * });
   */
  constructor(address, password, onStats) {
    if (!address) return console.error('address required');
    if (!password) return console.error('password required');
    console.log(`${new Date().toLocaleString().yellow} - Getting RCON stats from ${address.magenta} with password ${password.magenta}`);
    this.rcon = RCON({
      address: address,
      password: password
    });
    this.onStats = onStats;
    this.interval = 10000;
    this.db = "srcds_db";
    setInterval(_ => this._connect().then(this._ping.bind(this)), this.interval);
  }
  /**
   * connects to the game server rcon
   * 
   * @returns {Promise<Void>} nothing
   * 
   * @example <caption>Example usage of _connect() function.</caption>
   * RconStats._connect().then(_ => {
   * // connected
   * });
   */
  _connect() {
    return new Promise(resolve => {
      this.rcon.connect().then(resolve).catch(e => {});
    });
  }

  /**
   * runs stats command
   * 
   * @returns {Promise<String>} rcon stats output
   * 
   * @example <caption>Example usage of _getStats() function.</caption>
   * RconStats._getStats().then(res => {
   * // res = stats output string
   * });
   */
  _getStats() {
    return new Promise(resolve => {
      this.rcon.command('stats').then(resolve).catch(this._error);
    });
  }

  /**
   * get usable data from the response then loges it to database before passing it to the callback function
   * @param {String} response 
   * 
   * @returns {CallableFunction<Object>} fires when stats are processed 
   * 
   * @example <caption>Example usage of _parseStats() function.</caption>
   * RconStats._parseStats(res);
   */
  _parseStats(response) {
    // console.log(response);
    if (!response) return reject();
    var stat = response.split('\n')[1].split(" ");
    // Remove blank spaces
    stat = stat.filter(e => {
      return e === 0 || e;
    }).filter(e => {
      return e === 0 || e != " ";
    });
    // Cast to floats/ints otherwise influx will throw a fit
    for(var i = 0; i < stat.length; i++) { 
      stat[i] = Number(stat[i]); 
      if (isNaN(stat[i])) return;
    }
    if (typeof stat !== 'object') return;
    try {
      influx.dbInsert(stat, this.db);
    } catch(e) {
      // console.error(e);
    }
    if (this.onStats) this.onStats(stat);
  }

  _error(e) {
    console.error(new Date().toLocaleString().yellow, '-'.yellow, 'RCON'.red, e.message.red);
  }

  /**
   * loop to get data at a preset interval
   * 
   * @async
   * 
   * @returns {Void} nothing
   * 
   * @example <caption>Example usage of _ping() function.</caption>
   * RconStats._ping();
   */
  async _ping() {
    try {
      this._parseStats(await this._getStats());
    } catch(e) {
      this._error(e);
    }
  }
}

module.exports = RconStats;