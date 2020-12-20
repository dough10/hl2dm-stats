
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
  data.players = [];
  for(var i = 11; i < lines.length - 1; i++) {
    var pdetails = lines[i].replace(/\s+/g,',').trim().split(',');
    var str = '';
    for (var ndx = 2; ndx < pdetails.length - 6; ndx++) {
      str = str + pdetails[ndx] + ' ';
    }
    var obj = {
      name: str.trim(),
      sessionid: pdetails[1],
      address: pdetails[pdetails.length - 1],
      status: pdetails[pdetails.length - 2],
      timeOnline: pdetails[pdetails.length - 5],
      steamid: pdetails[pdetails.length - 6],
    };
    console.log(pdetails[i])
    data.players.push(obj);
  }
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
