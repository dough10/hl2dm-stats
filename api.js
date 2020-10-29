console.log(`${new Date()} - Loading imports`);
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const express = require('express');
const compression = require('compression');
const app = express();
app.use(compression());
var expressWs = require('express-ws')(app);
const Gamedig = require('gamedig');
const schedule = require('node-schedule');
const SteamID = require('steamid');

const config = require(`${__dirname}/config.json`);
const logFolder = path.join(config.gameServerDir, 'logs');

var users = {};              // all users go in this object ie. {steamid: {name:playername, kills: 1934, deaths: 1689, kdr: 1.14, .....}, steamid: {..}, ..}
var totalFiles = 0;          // total # of log files in "logs" folder
var top = [];                // players with over 100 kills sorted by KDR
var weapons = {};            // server wide kill count sorted by weapons
var serverStatus;            // placeholder for gamedig state
var totalPlayers = 0;        // count of total players to have joined the server
var updated = false;         // if stats have been updated when a player reaches end of game kill count

var socket;

console.log(`${new Date()} - Load Functions`);

Object.size = obj => {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

function isWeapon(weapon) {
  var w = [
    '357',
    'ar2',
    'combine_ball',
    'crossbow_bolt',
    'crowbar',
    'grenade_frag',
    'physbox',
    'physics',
    'pistol',
    'shotgun',
    'smg1',
    'smg1_grenade',
    'stunstick',
    'rpg_missile',
    'world',
    'headshots',
    'physcannon'
  ];
  return w.includes(weapon);
}

function validateIPaddress(ip) {
  return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
}

function cacheTopResponse() {
  console.log(`${new Date()} - Clearing cache & parsing logs`);
  parseLogs().then(stats => {
    top = stats;
    // merge physics kills
    if (!weapons.physics) {
      weapons.physics = 0;
    }
    if (!weapons.physbox) {
      weapons.physbox = 0;
    }
    if (!weapons.world) {
      weapons.world = 0;
    }
    weapons.physics = (weapons.physics + weapons.physbox) + weapons.world;
    delete weapons.physbox;
    delete weapons.world;
    if (weapons.physics === 0) {
      delete weapons.physics;
    }
    // convert weapons object into sorted by kill count array
    weapons = sortWeapons(weapons);
    for (var i = 0; i < top.length; i++) {
      // merge player physics kills
      if (!top[i].physics) {
        top[i].physics = 0;
      }
      if (!top[i].physbox) {
        top[i].physbox = 0;
      }
      if (!top[i].world) {
        top[i].world = 0;
      }
      top[i].physics = (top[i].physics + top[i].physbox) + top[i].world;
      delete top[i].physbox;
      delete top[i].world;
      if (top[i].physics === 0) {
        delete top[i].physics;
      }
      // extract weapons from player object and place in sorted by kill count array
      top[i].weapons = sortWeapons(top[i]);
    }
    setTimeout(_ => {
      updated = false;
    }, 60000);
    console.log(`${new Date()} - Logs parsed & cached`);
  });
}

function parseLogs() {
  return new Promise((resolve, reject) => {
    weapons = {};
    fs.readdir(logFolder, (err, files) => {
      var remaining = '';
      if (err) {
        return console.log(`${new Date()} - Unable to scan directory: ` + err);
      }
      totalFiles = files.length;
      files.forEach(function (file) {
        try {
          const rl = readline.createInterface({
            input: fs.createReadStream(path.join(logFolder, file)),
            crlfDelay: Infinity
          });
          rl.on('line', scanLine);
          rl.on('close', _ => {
            totalFiles = totalFiles - 1;
            if (totalFiles === 0) {
              resolve(sortUsersByKDR());
            }
          });
        } catch (e) {
          console.error(e);
        }
      });
    });
  });
}

function getName(word) {
  if (!word) {
    return false;
  }
  word = word.replace('"', '');
  var end = word.search(/<([1-9][0-9]{0,2}|1000)>/);
  var str = '';
  for (var i = 0; i < end; i++) {
    str = str + word[i];
  }
  return str;
}

function getID2(word) {
  if (!word) {
    return false;
  }
  const u = word.search(/STEAM_[0-1]:[0-1]:/g);
  if (u < 0) {
    return false;
  }
  const start = u;
  word = word.substring(start)
  const end = word.search('>');
  let str = '';
  for (var i = 0; i < end; i++) {
    str = str + word[i];
  }
  return str;
}

function getID3(word) {
  if (!word) {
    return false;
  }
  const u = word.search(/U:[0-1]:/);
  if (u < 0) {
    return false;
  }
  const start = u + 4;
  word = word.substring(start)
  const end = word.search(']');
  let str = '';
  for (var i = 0; i < end; i++) {
    str = str + word[i];
  }
  return str;
}

function buildKillerNameString(line, end)  {
  let name = '';
  let start = 4;
  const isTime = /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d):$/;
  for (let i = 0; i < line.length; i++) {
    if (isTime.test(line[i])) {
      start = i + 1;
    }
  }
  for (var i = start; i < end; i++) {
    name = `${name}${line[i]} `;
  }
  return name
}

function buildKilledNameString(line, start) {
  var end = 7;
  for (var i = start; i < line.length; i++) {
    if (line[i] === 'with') {
      end = i;
    }
  }
  var name = '';
  for (var i = start; i < end; i++) {
    name = `${name}${line[i]} `;
  }
  return name;
}

function lineIsKill(line) {
  for (var i = 0; i < line.length; i++) {
    if (line[i] === 'killed') {
      return i;
    }
  }
  return false;
}

function lineIsConnect(line) {
  for (var i = 0; i < line.length; i++) {
    if (line[i] === 'connected,') {
      return i;
    }
  }
  return false;
}

function lineIsSuicide(line) {
  for (var i = 0; i < line.length; i++) {
    if (line[i] === 'committed') {
      return i;
    }
  }
  return false;
}

function lineIsChat(line) {
  for (var i = 0; i < line.length; i++) {
    if (line[i] === 'say') {
      return i;
    }
  }
  return false;
}

function lineIsHeadshot(line) {
  for (var i = 0; i < line.length; i++) {
    if (line[i] === '"headshot"') {
      return i;
    }
  }
  return false;
}

function lineIsStats(line) {
  for (var i = 0; i < line.length; i++) {
    if (line[i] === '"weaponstats"') {
      return i;
    }
  }
  return false;
}

function scanLine(line) {
  var word  = line.split(' ');
  var isKill = lineIsKill(word);
  var isConnect = lineIsConnect(word);
  var isSuicide = lineIsSuicide(word);
  var isChat = lineIsChat(word);
  var isHeadshot  = lineIsHeadshot(word);
  var isStats = lineIsStats(word);
  if (isChat) {
    var nameString = buildKillerNameString(word, isChat);
    var id = getID3(nameString);
    var name = getName(nameString);
    if (!users[id]) {
      users[id] = {
        name: name,
        id: id,
        kills: 0,
        deaths: 0,
        kdr: 0,
        chat: []
      };
    }
    if (users[id].name !== name) {
      users[id].name = name;
    }
    var said = '';
    for (var i = (isChat + 1); i < word.length; i++) {
      said = `${said}${word[i]} `;
    }
    said.replace('"', '');
    said.replace('"', '');
    users[id].chat.push(said);
  } else if (isConnect) {
    var connectedNameString = buildKillerNameString(word, isConnect);
    var connectedUser = getID3(connectedNameString);
    var connectedUserName = getName(connectedNameString);
    var ip = word[isConnect  + 2].replace('"', '');
    ip = ip.replace('"', '');
    ip = ip.replace(/:\d{4,5}$/, '');
    if (validateIPaddress(ip)) {
      if (!users[connectedUser]) {
        users[connectedUser] = {
          name: connectedUserName,
          id:connectedUser,
          ip: ip,
          kills: 0,
          deaths: 0,
          kdr: 0,
          chat: []
        };
      } else {
        users[connectedUser].ip = ip;
      }
      if (users[connectedUser].name !== connectedUserName) {
        users[connectedUser].name = connectedUserName;
      }
    }
  } else if (isKill) {
    var killerNameString = buildKillerNameString(word, isKill);
    var killerID = getID3(killerNameString);
    var killerName = getName(killerNameString);
    var killedNameString = buildKilledNameString(word, isKill + 1);
    var killedID = getID3(killedNameString);
    var killedName = getName(killedNameString);
    var weapon = word[word.length - 1].replace('"', '').replace('"', '');
    if (!killerID) {
      console.log(`${line} killer error`);
      return;
    }
    if (!killerName) {
      console.log(`${line} killerName error`);
      return;
    }
    if (!killedID) {
      console.log(`${line} killed error`);
      return;
    }
    if (!killedName) {
      console.log(`${line} killedName error`);
      return;
    }
    if (!isWeapon(weapon)) {
      console.log(`${line} weapon error`);
      return;
    }
    // killer
    if (!users[killerID]) {
      users[killerID] = {
        name: killerName,
        id:killerID,
        kills: 0,
        deaths: 0,
        kdr: 0,
        chat: []
      };
    }
    // killed
    if (!users[killedID]) {
      users[killedID] = {
        name: killedName,
        id: killedID,
        kills: 0,
        deaths: 0,
        kdr: 0,
        chat: []
      };
    }
    if (users[killerID].name !== killerName) {
      users[killerID].name = killerName;
    }
    if (users[killedID].name !== killedName) {
      users[killedID].name = killedName;
    }
    // add kill
    users[killerID].kills++;
    // add death
    users[killedID].deaths++;
    // calculate KDR
    users[killerID].kdr = Number((users[killerID].kills / users[killerID].deaths).toFixed(2));
    if (users[killerID].kdr === Infinity) {
      users[killerID].kdr = users[killerID].kills;
    }
    users[killedID].kdr = Number((users[killedID].kills / users[killedID].deaths).toFixed(2));
    // add weapon for killer
    if (!users[killerID][weapon]) {
      users[killerID][weapon] = 0;
    }
    // add weapon for server
    if (!weapons[weapon]) {
      weapons[weapon] = 0;
    }
    // add killer kill with weapon
    users[killerID][weapon]++;
    // add server wide weapon kill
    weapons[weapon]++;
  } else if (isSuicide) {
    var nameString = buildKillerNameString(word, isSuicide);
    var id = getID3(nameString);
    var name = getName(nameString);
    if (!id) {
      console.log(new Date() + line +  ' id error');
      return;
    }
    if (!users[id]) {
      users[id] = {
        name: name,
        id: id,
        kills: 0,
        deaths: 0,
        kdr: 0,
        chat: []
      };
    }
    if (users[id].name !== name) {
      users[id].name = name;
    }
    users[id].kills--;
    users[id].deaths++;
    users[id].kdr = Number((users[id].kills / users[id].deaths).toFixed(2));
    var weapon = word[word.length - 1].replace('"', '');
    weapon = weapon.replace('"', '');
    if (!isWeapon(weapon)) {
      console.log(`${line} weapon error`);
      return;
    }
    if (!weapons[weapon]) {
      weapons[weapon] = 0;
    }
    weapons[weapon]++;
  } else if (isHeadshot) {
    if (!weapons.headshots) {
      weapons.headshots = 0;
    }
    weapons.headshots++;
    var killerNameString = buildKillerNameString(word, isHeadshot - 1);
    var id = getID2(killerNameString);
    var name = getName(killerNameString);
    var sid = new SteamID(id);
    var id3 = getID3(sid.getSteam3RenderedID());
    if (!id3) {
      console.log(line);
      return;
    }
    if (!users[id3]) {
      users[id3] = {
        name: name,
        id: id,
        kills: 0,
        deaths: 0,
        kdr: 0,
        chat: []
      };
    }
    if (!users[id3].headshots) {
      users[id3].headshots = 0;
    }
    users[id3].headshots++;
    if (users[id3].name !== name) {
      users[id3].name = name;
    }
  }
  // else if (isStats) {
  //   var nameString = buildKillerNameString(word, isStats - 1);
  //   var stats = line.split('(');
  //   var id = getID2(nameString);
  //   var sid = new SteamID(id);
  //   var id3 = getID3(sid.getSteam3RenderedID());
  //   var name = getName(nameString);
  //   var arr = [];
  //   var arr2 = [];
  //   console.log(name, id3);
  //   for (var i = 1; i < stats.length; i++) {
  //     var items = stats[i].split(' ');
  //     for (var o = 0; o < items.length; o++) {
  //       items[o] = items[o].replace('"', '').replace('"', '').replace(')', '');
  //       if (o < 0) {
  //         items[o] = Number(items[o])
  //       }
  //     }
  //     arr2.push(items[0]);
  //     arr.push(items[1]);
  //   }
  //   console.log(arr2)
  //   console.log(arr)
  // }
}

function sortWeapons(user) {
  var sortArr = [];
  for (var weapon in user) {
    if (isWeapon(weapon)) {
      sortArr.push([weapon, user[weapon]]);
      delete user[weapon];
    }
  }
  sortArr.sort((a, b) => {
    return a[1] - b[1];
  });
  sortArr.reverse();
  return sortArr;
}

function sortUsersByKDR() {
  var arr = [];
  totalPlayers = Object.size(users);
  for (var user in users) {
    if (users[user].kills >= 100) {
      arr.push(users[user]);
    }
  }
  arr.sort((a,b) => {
    return a.kdr - b.kdr;
  });
  arr.reverse();
  users = {};
  return arr;
}

function getDemos() {
  return new Promise((resolve, reject) => {
    var demos = [];
    fs.readdir(config.gameServerDir, (err, files) => {
      for (var i = 0; i < files.length; i++) {
        if (path.extname(files[i]) === '.dem') {
          demos.push(files[i]);
        }
      }
      resolve(demos);
    });
  });
}

function createdDate(file) {
  const stats = fs.statSync(file)
  return stats.mtime
}

function getFilesizeInBytes(filename) {
  var stats = fs.statSync(filename)
  var fileSizeInBytes = stats["size"]
  return fileSizeInBytes
}

function bytesToSize(bytes) {
   var sizes = [
     'Bytes',
     'KB',
     'MB',
     'GB',
     'TB'
   ];
   if (bytes == 0) {
     return '0 Byte';
   }
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return `${Math.round(bytes / Math.pow(1024, i), 2)} ${sizes[i]}`;
}

function getServerStatus() {
  Gamedig.query({
    type: 'hl2dm',
    host: config.serverHostname
  }).then((state) => {
    serverStatus = state;
    if (serverStatus.players.length > 0) {
      for (var i = 0; i < serverStatus.players.length; i++) {
        if (serverStatus.players[i].score === Number(serverStatus.raw.rules.mp_fraglimit) && !updated) {
          updated = true;
          cacheTopResponse();
        }
      }
      console.log(`${new Date()} - `, serverStatus.players);
    }
    socket.send(JSON.stringify(serverStatus));
  }).catch((error) => {
    serverStatus = 'offline';
  });
}

function cleanUp() {
  console.count('cleanup-function')
  var now = new Date();
  var lastMonth = now.setMonth(now.getMonth() - 1);
  var folder = './oldTop';
  if (!fs.existsSync(folder)){
    fs.mkdirSync(folder);
  }
  fs.writeFile(`./oldTop/${lastMonth}.json`, JSON.stringify(top), e => {
    if (err) return console.log(err);
    console.log(`${new Date()} - Last month top data saved as ${lastMonth}.json`);
    var numFiles = 0;
    fs.readdir(logFolder, (err, files) => {
      console.log(`${new Date()} - Running file clean up`);
      numFiles = numFiles + files.length;
      files.forEach(fs.unlinkSync);
      fs.readdir(config.gameServerDir, (err, files) => {
        files.forEach(file => {
          numFiles = numFiles + files.length;
          if (path.extname(file) === '.dem') {
            fs.unlinkSync(file);
          }
        });
        console.log(`${new Date()} - Clean up complete. Removed ${numFiles} files`);
        parseLogs();
      });
    });
  });
;}

console.log(`${new Date()} - Getting data`);
cacheTopResponse();
setInterval(cacheTopResponse, 3600000);

getServerStatus();
setInterval(getServerStatus, 5000);

var j = schedule.scheduleJob('* * * 1 * *', cleanUp);

console.log(`${new Date()} - Loading API backend calls`);
app.get('/stats', (req, res) => {
  res.send(JSON.stringify([
    top,
    weapons,
    totalPlayers
  ]));
});

app.get('/status', (reg, res) => {
  res.send(serverStatus);
});

app.get('/download/:file', (reg, res) => {
  var dl = `${config.gameServerDir}/${reg.params.file}`;
  console.log(`${new Date()} - File downloaded `, dl);
  res.download(dl, reg.params.file);
});

app.get('/demos', (reg,res) => {
 var html = '<head><title>Lo-g Deathmatch Hoedown Demos</title></head><h1 style="text-align: center">Lo-g Deathmatch Hoedown Demos</h1><table style="width: 100%"><tr><th>filename</th><th>size</th><th>date/time</th></tr>';
 getDemos().then(demos => {
   for (var i = 0; i < demos.length; i++) {
     html = `${html}<tr><th><a href=/api/download/${demos[i]}>${demos[i]}</a></th><th>${bytesToSize(getFilesizeInBytes(`${config.gameServerDir }/${demos[i]}`))}</th><th>${createdDate(`${config.gameServerDir}/${demos[i]}`)}</th></tr>`;
   }
   res.send(`${html}</table>`);
 });
});

app.ws('/', (ws, req) => {
  socket = ws;
  socket.send(JSON.stringify(serverStatus));
});

app.listen(3000);

console.log(`${new Date()} - API is now active on port 3000`);
console.log(`${new Date()} - log folder = ${logFolder}`);
