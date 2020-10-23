console.log(`${new Date()} - Loading imports`);
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const express = require('express')
const app = express();
const Gamedig = require('gamedig');
var schedule = require('node-schedule');

const dir = "/appdata/hl2dm/hl2mp";
const logFolder = path.join(dir, 'logs');

var users = {};
var totalFiles = 0;
var top = [];
var weapons = {};
var serverStatus;

console.log(`${new Date()} - Load Functions`);
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
    'world'
  ];
  return w.includes(weapon);
}

function validateIPaddress(ip) {
  return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
}

function cacheTopResponse() {
  console.log(`${new Date()} - Parsing logs`);
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
    weapons.physics = weapons.physics + weapons.physbox;
    weapons.physics = weapons.physics + weapons.world;
    delete weapons.physbox;
    delete weapons.world;
    if (weapons.physics === 0) {
      delete weapons.physics;
    }
    weapons = sortWeapons(weapons);
    for (var i = 0; i < top.length; i++) {
      if (!top[i].physics) {
        top[i].physics = 0;
      }
      if (!top[i].physbox) {
        top[i].physbox = 0;
      }
      if (!top[i].world) {
        top[i].world = 0;
      }
      top[i].physics = top[i].physics + top[i].physbox;
      top[i].physics = top[i].physics + top[i].world;
      delete top[i].physbox;
      delete top[i].world;
      if (top[i].physics === 0) {
        delete top[i].physics;
      }
      top[i].weapons = sortWeapons(top[i]);
    }
    setTimeout(_ => {
      updated = false;
    }, 10000);
    console.log(`${new Date()} - Logs parsed & cached`);
  });
}

async function parseLogs() {
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

function getID(word) {
  if (!word) {
    return false;
  }
  const u = word.search('U:1:');
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

function scanLine(line) {
  var word  = line.split(' ');
  var isKill = lineIsKill(word);
  var isConnect = lineIsConnect(word);
  var isSuicide = lineIsSuicide(word);
  var isChat = lineIsChat(word);
  var isHeadshot  = lineIsHeadshot(word);
  if (isHeadshot) {
    console.log(line);
  }
  if (isKill) {
    var killerNameString = buildKillerNameString(word, isKill);
    var killerID = getID(killerNameString);
    var killerName = getName(killerNameString);
    var killedNameString = buildKilledNameString(word, isKill + 1);
    var killedID = getID(killedNameString);
    var killedName = getName(killedNameString);
    var weapon = word[word.length - 1].replace('"', '');
    weapon = weapon.replace('"', '');
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
        headshots: 0,
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
        headshots: 0,
        chat: []
      };
    }
    // add kill
    users[killerID].kills = users[killerID].kills + 1;
    // add death
    users[killedID].deaths = users[killedID].deaths + 1
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
    users[killerID][weapon] = users[killerID][weapon] + 1;
    // add server wide weapon kill
    weapons[weapon] = weapons[weapon] + 1;
  }
  else if (isConnect) {
    var connectedNameString = buildKillerNameString(word, isConnect);
    var connectedUser = getID(connectedNameString);
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
          headshots: 0,
          chat: []
        };
      } else {
        users[connectedUser].ip = ip;
      }
    }
  }
  else if (isSuicide) {
    var nameString = buildKillerNameString(word, isSuicide);
    var id = getID(nameString);
    var name = getName(nameString);
    if (!id) {
      console.log(new Date() + line +  ' id error');
    }
    if (!users[id]) {
      users[id] = {
        name: name,
        id: id,
        kills: 0,
        deaths: 0,
        kdr: 0,
        headshots: 0,
        chat: []
      };
    }
    users[id].kills = users[id].kills - 1;
    users[id].deaths = users[id].deaths + 1;
    users[id].kdr = Number((users[id].kills / users[id].deaths).toFixed(2));
    var weapon = word[word.length - 1].replace('"', '');
    weapon = weapon.replace('"', '');
    if (!isWeapon(weapon)) {
      console.log(`${line} weapon error`);
      return;
    }
    // if (!users[id][weapon]) {
    //   users[id][weapon] = 0;
    // }
    // users[id][weapon] = users[id][weapon] + 1;
    if (!weapons[weapon]) {
      weapons[weapon] = 0;
    }
    weapons[weapon] = weapons[weapon] + 1;
  }
  else if (isChat) {
    var nameString = buildKillerNameString(word, isChat);
    var id = getID(nameString);
    var name = getName(nameString);
    if (!users[id]) {
      users[id] = {
        name: name,
        id: id,
        kills: 0,
        deaths: 0,
        kdr: 0,
        headshots: 0,
        chat: []
      };
    }
    var said = '';
    for (var i = (isChat + 1); i < word.length; i++) {
      said = `${said}${word[i]} `;
    }
    said.replace('"', '');
    said.replace('"', '');
    users[id].chat.push(said);
  }
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
    fs.readdir(dir, (err, files) => {
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

var updated = false;
function getServerStatus() {
  Gamedig.query({
    type: 'hl2dm',
    host: 'hl2dm.dough10.me'
  }).then((state) => {
    serverStatus = state;
    if (serverStatus.players.length > 0) {
      for (var i = 0; i < serverStatus.players.length; i++) {
        if (serverStatus.players[i].score === 60 && !updated) {
          updated = true;
          cacheTopResponse();
        }
      }
      console.log(`${new Date()} - `, serverStatus.players);
    }
  }).catch((error) => {
    serverStatus = 'offline';
    console.log(`${new Date()} - hl2dm server is offline`, error);
  });
}

function cleanUp() {
  console.log(`${new Date()} - Running file clean up`);
  var numFiles = 0;
  fs.readdir(logFolder, (err, files) => {
    numFiles = numFiles + files.length;
    files.forEach(fs.unlinkSync);
    fs.readdir(dir, (err, files) => {
      files.forEach(file => {
        numFiles = numFiles + files.length;
        if (path.extname(file) === '.dem') {
          fs.unlinkSync(file);
          console.log(`${new Date()} - Clean up complete. Removed ${numFiles} files`);
        }
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
  res.send(JSON.stringify([top, weapons]));
});

app.get('/status', (reg, res) => {
  res.send(serverStatus);
});

app.get('/download/:file', (reg, res) => {
  var dl = `${dir}/${reg.params.file}`;
  console.log(`${new Date()} - File downloaded `, dl);
  res.download(dl, reg.params.file);
});

app.get('/demos', (reg,res) => {
 var html = '<head><title>Lo-g Deathmatch Hoedown Demos</title></head><h1 style="text-align: center">Lo-g Deathmatch Hoedown Demos</h1><table style="width: 100%"><tr><th>filename</th><th>size</th><th>date/time</th></tr>';
 getDemos().then(demos => {
   for (var i = 0; i < demos.length; i++) {
     html = `${html}<tr><th><a href=/api/download/${demos[i]}>${demos[i]}</a></th><th>${bytesToSize(getFilesizeInBytes(`${dir }/${demos[i]}`))}</th><th>${createdDate(`${dir}/${demos[i]}`)}</th></tr>`;
   }
   res.send(`${html}</table>`);
 });
});

app.listen(3000);

console.log(`${new Date()} - API is now active on port 3000`);
console.log(`${new Date()} - log folder = ${logFolder}`);
