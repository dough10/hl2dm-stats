const Timer = require('../modules/Timer.js');
var rcon = require('srcds-rcon')({
  address: '192.168.86.2',
  password: 'oicu812'
});





function parseStatus(s) {
  var data = {};
  var lines = s.split('\n');
  for (var i = 0; i < 9; i++) {
    var details = lines[i].split(':');
    data[details[0].trim()] = details[1].trim().replace(' at', '');
  }
  delete data.steamid;
  delete data.tags;
  delete data.version;
  delete data['udp/ip'];
  delete data.edicts;
  var p = [];
  for(var i = 11; i < lines.length - 1; i++) {
    var pdetails = lines[i].replace(/\s+/g,',').trim().split(',');
    var obj = {
      sessionid: pdetails[1]
    };
    p.push(obj);
    console.log(i, pdetails, pdetails.length)
  }
  data.players = p;
  console.log(data);
}


console.log('connecting');
rcon.connect().then(_ => {
  setInterval(_ => {
    rcon.command('status').then(parseStatus);
  }, 10000);
}).catch(err => {
  console.log('caught', err);
  console.log(err.stack);
});
