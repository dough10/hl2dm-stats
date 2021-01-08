var influx = require('./influx-middle');
var RCON = require('srcds-rcon');

class RconStats {
  constructor(address, password, onStats) {
    if (!address) return console.error('address required');
    if (!password) return console.error('password required');
    this.rcon = RCON({
      address: address,
      password: password
    });
    this.onStats = onStats;
    this.interval = 60000;
    this.db = "srcds_db";
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
    // console.log('stats: ' + stat);
    influx.dbInsert(stat, this.db);
    this.rcon.disconnect();
    if (this.onStats) this.onStats(stat);
  }
  ping() {
    setTimeout(_ => {
      this.ping();
    }, this.interval);
    this.connect()
    .then(this.getStats.bind(this))
    .then(this.parseStats.bind(this)).catch(console.error);
  }
}

module.exports = RconStats;