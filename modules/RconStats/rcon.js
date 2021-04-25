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
   * @example <caption>Example usage of RconStats Class.</caption>
   * new RconStats('127.0.0.1', 'suspersecurepassword', stats => {
   * // stats object that was logged to database
   * });
   */
  constructor(address, password, onStats) {
    if (!address) return console.error('address required');
    if (!password) return console.error('password required');
    this.rcon = RCON({
      address: address,
      password: password
    });
    this.onStats = onStats;
    this.interval = 10000;
    this.db = "srcds_db";
    this._connect().then(this._ping.bind(this));
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
    return new Promise((resolve, reject) => {
      this.rcon.connect().then(resolve).catch(reject);
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
    return new Promise((resolve, reject) => {
      this.rcon.command('stats').then(resolve).catch(reject);
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
    influx.dbInsert(stat, this.db);
    if (this.onStats) this.onStats(stat);
  }

  /**
   * loop to get data at a preset interval
   * 
   * @returns {Void} nothing
   * 
   * @example <caption>Example usage of _ping() function.</caption>
   * RconStats._ping();
   */
  _ping() {
    setTimeout(_ => {
      this._ping();
    }, this.interval);
    try {
      this._getStats().then(this._parseStats.bind(this)).catch(e => {
        console.error(new Date().toLocaleString().yellow, '-'.yellow, 'RCON'.red, e.message.red);
        console.count('promise');
      });
    } catch(e) {
      console.error(new Date().toLocaleString().yellow, '-'.yellow, 'RCON'.red, e.message.red);
      console.count('try');
    }
  }
}

module.exports = RconStats;