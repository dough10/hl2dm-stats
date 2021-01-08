var influx = require('./influx-middle');
var RCON = require('srcds-rcon');

class RconStats {
  constructor(address, password, interval, db) {
    if (!address) return console.error('address required');
    if (!password) return console.error('password required');
    this.rcon = RCON({
      address: address,
      password: password
    });
    this.interval = interval || 60000;
    this.db = db|| "srcds_db";
  }
  connect() {
    return new Promise((resolve, reject) => {
      this.rcon.connect().then(resolve).catch(reject);
    });
  }
  getStats() {
    return new Promise((resolve, reject) => {
      this.rcon.command('stats').then(resolve).catch(reject);
    });
  }
  parseStats(response) {
    return new Promise((resolve, reject) => {
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
      }
      // console.log('stats: ' + stat);
      influx.dbInsert(stat, this.db);
      resolve(stat);
      this.rcon.disconnect();
    });
  }
  ping() {
    setTimeout(_ => {
      this.ping();
    }, this.interval);
    this.connect()
    .then(this.getStats.bind(this))
    .then(this.parseStats.bind(this));
  }
}

module.exports = RconStats;